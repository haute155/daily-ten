import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryDto } from './dto/category.dto';

/** 기본 카테고리 라벨 — 커스텀이 기본과 겹치지 않게 막는다 */
const DEFAULT_LABELS = [
  '운동',
  '수면',
  '학습',
  '힐링',
  '식습관',
  '업무',
  '미분류',
];

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
    if (DEFAULT_LABELS.includes(label)) {
      throw new ConflictException('기본 카테고리와 같은 이름은 쓸 수 없습니다');
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
    if (DEFAULT_LABELS.includes(label)) {
      throw new ConflictException('기본 카테고리와 같은 이름은 쓸 수 없습니다');
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
