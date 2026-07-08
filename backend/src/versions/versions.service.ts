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

      if (latest) {
        await tx.checklistVersion.update({
          where: { id: latest.id },
          data: {
            effectiveTo: dayjs(effectiveFrom)
              .subtract(1, 'day')
              .format('YYYY-MM-DD'),
          },
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
