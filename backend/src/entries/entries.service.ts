import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertEntryDto } from './dto/upsert-entry.dto';

interface StoredChecklistItem {
  id: string;
  weight: number;
  isActive: boolean;
}

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * 날짜별 기록 upsert. 도메인 규칙을 서버가 보장한다:
   * - 하루 1엔트리 (date 기준)
   * - 버전 결정: 사용자가 명시적으로 선택한 버전(dto.checklistVersionId) >
   *   기존 기록의 버전 > 해당 날짜의 활성 버전
   * - 점수는 항상 서버가 버전 가중치로 재계산 (클라이언트 점수를 믿지 않음)
   */
  async upsert(userId: string, date: string, dto: UpsertEntryDto) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('날짜는 YYYY-MM-DD 형식이어야 합니다');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.dailyEntry.findUnique({
        where: { userId_date: { userId, date } },
      });

      // 사용자가 레시피를 직접 골랐으면 그 버전(본인 소유 검증), 아니면 기존 규칙
      const version = dto.checklistVersionId
        ? await tx.checklistVersion.findFirst({
            where: { id: dto.checklistVersionId, userId },
          })
        : existing
          ? await tx.checklistVersion.findFirst({
              where: { id: existing.checklistVersionId, userId },
            })
          : await tx.checklistVersion.findFirst({
              where: { userId, effectiveFrom: { lte: date } },
              orderBy: { versionNumber: 'desc' },
            });

      if (!version) {
        throw new NotFoundException(
          dto.checklistVersionId
            ? '선택한 레시피 버전을 찾을 수 없습니다'
            : '해당 날짜에 적용되는 체크리스트 버전이 없습니다',
        );
      }

      const items = version.items as unknown as StoredChecklistItem[];
      const score = items
        .filter((item) => item.isActive && dto.checkedItemIds.includes(item.id))
        .reduce((sum, item) => sum + item.weight, 0);

      if (existing) {
        return tx.dailyEntry.update({
          where: { id: existing.id },
          data: {
            checkedItemIds: dto.checkedItemIds,
            score,
            note: dto.note,
            checklistVersionId: version.id, // 사용자가 레시피를 바꿔 골랐으면 링크도 갱신
          },
        });
      }

      return tx.dailyEntry.create({
        data: {
          id: randomUUID(),
          userId,
          date,
          checklistVersionId: version.id,
          checkedItemIds: dto.checkedItemIds,
          score,
          note: dto.note,
        },
      });
    });
  }
}
