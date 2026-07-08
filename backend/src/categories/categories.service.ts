import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './dto/category.dto';

/** 예약어 — 시스템이 폴백 표시로 쓰는 이름만 막는다 */
const RESERVED_LABELS = ['미분류'];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.customCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CategoryDto) {
    const label = dto.label.trim();
    if (RESERVED_LABELS.includes(label)) {
      throw new ConflictException('사용할 수 없는 이름입니다');
    }
    const existing = await this.prisma.customCategory.findUnique({
      where: { userId_label: { userId, label } },
    });
    if (existing) {
      throw new ConflictException('이미 있는 카테고리입니다');
    }
    return this.prisma.customCategory.create({ data: { userId, label } });
  }

  async update(userId: string, id: string, dto: CategoryDto) {
    const label = dto.label.trim();
    const category = await this.prisma.customCategory.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다');
    if (RESERVED_LABELS.includes(label)) {
      throw new ConflictException('사용할 수 없는 이름입니다');
    }
    return this.prisma.customCategory.update({
      where: { id },
      data: { label },
    });
  }

  async remove(userId: string, id: string) {
    const category = await this.prisma.customCategory.findFirst({
      where: { id, userId },
    });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다');
    await this.prisma.customCategory.delete({ where: { id } });
    return { ok: true };
  }
}
