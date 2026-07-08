import { BadRequestException, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVersionDto } from './dto/create-version.dto';

export const TOTAL_SCORE = 10;

@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.checklistVersion.findMany({
      where: { userId },
      orderBy: { versionNumber: 'asc' },
    });
  }

  /**
   * 새 버전 생성. 도메인 규칙을 서버가 보장한다:
   * - 가중치 합은 10점
   * - versionNumber는 마지막 버전 + 1 (append-only)
   * - 오늘 기록이 이미 있으면 effectiveFrom은 내일
   * - 이전 버전은 effectiveFrom 전날로 닫는다
   * - 단, 최신 버전이 아직 발효 전(draft: 연결 기록 0개 + effectiveFrom ≥ 오늘)이면
   *   새 버전을 만들지 않고 그 버전을 덮어쓴다 (버전 노이즈 방지 — "버전 = 실제로 살아본 구성")
   */
  async create(userId: string, dto: CreateVersionDto) {
    const totalScore = dto.items.reduce((sum, item) => sum + item.weight, 0);
    if (totalScore !== TOTAL_SCORE) {
      throw new BadRequestException(
        `가중치 합이 ${TOTAL_SCORE}점이어야 합니다 (현재 ${totalScore}점)`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const latest = await tx.checklistVersion.findFirst({
        where: { userId },
        orderBy: { versionNumber: 'desc' },
      });

      const todayEntry = await tx.dailyEntry.findUnique({
        where: { userId_date: { userId, date: dto.clientToday } },
      });

      const effectiveFrom = todayEntry
        ? dayjs(dto.clientToday).add(1, 'day').format('YYYY-MM-DD')
        : dto.clientToday;
      const closePreviousTo = dayjs(effectiveFrom)
        .subtract(1, 'day')
        .format('YYYY-MM-DD');

      if (latest) {
        const latestEntryCount = await tx.dailyEntry.count({
          where: { checklistVersionId: latest.id },
        });
        const isDraft =
          latestEntryCount === 0 && latest.effectiveFrom >= dto.clientToday;

        if (isDraft) {
          // draft 흡수: 이전 발효 버전의 마감일을 새 적용일 기준으로 재조정하고 draft를 덮어쓴다
          const previous = await tx.checklistVersion.findFirst({
            where: { userId, versionNumber: { lt: latest.versionNumber } },
            orderBy: { versionNumber: 'desc' },
          });
          if (previous) {
            await tx.checklistVersion.update({
              where: { id: previous.id },
              data: { effectiveTo: closePreviousTo },
            });
          }
          return tx.checklistVersion.update({
            where: { id: latest.id },
            data: {
              title: dto.title ?? latest.title,
              items: dto.items.map((item, idx) => ({ ...item, order: idx })),
              totalScore,
              changeSummary: dto.changeSummary ?? '',
              effectiveFrom,
              effectiveTo: null,
            },
          });
        }

        await tx.checklistVersion.update({
          where: { id: latest.id },
          data: { effectiveTo: closePreviousTo },
        });
      }

      const versionNumber = (latest?.versionNumber ?? 0) + 1;

      return tx.checklistVersion.create({
        data: {
          id: randomUUID(),
          userId,
          versionNumber,
          title: dto.title ?? `v${versionNumber} 루틴`,
          items: dto.items.map((item, idx) => ({
            ...item,
            order: idx,
          })),
          totalScore,
          changeSummary: dto.changeSummary ?? '',
          effectiveFrom,
          effectiveTo: null,
        },
      });
    });
  }
}
