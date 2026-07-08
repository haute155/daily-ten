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
   * - 새 기록은 해당 날짜에 적용되는 버전에 연결
   * - 기존 기록 수정은 기록이 연결된 버전 유지 (기록-버전 링크 불변)
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

      // 기존 기록이면 그 기록의 버전, 새 기록이면 해당 날짜의 활성 버전
      const version = existing
        ? await tx.checklistVersion.findFirst({
            where: { id: existing.checklistVersionId, userId },
          })
        : await tx.checklistVersion.findFirst({
            where: { userId, effectiveFrom: { lte: date } },
            orderBy: { versionNumber: 'desc' },
          });

      if (!version) {
        throw new NotFoundException(
          '해당 날짜에 적용되는 체크리스트 버전이 없습니다',
        );
      }

      const items = version.items as unknown as StoredChecklistItem[];
      const score = items
        .filter((item) => item.isActive && dto.checkedItemIds.includes(item.id))
        .reduce((sum, item) => sum + item.weight, 0);

      if (existing) {
        return tx.dailyEntry.update({
          where: { id: existing.id },
          data: { checkedItemIds: dto.checkedItemIds, score, note: dto.note },
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
