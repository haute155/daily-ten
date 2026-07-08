import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export const CATEGORY_KEYS = [
  'exercise',
  'sleep',
  'learning',
  'healing',
  'diet',
  'work',
] as const;

export class ChecklistItemDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  // 기본 키('exercise' 등) 또는 커스텀 카테고리 id — 표시용 메타데이터라 느슨히 검증
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @IsInt()
  @Min(1)
  weight: number;

  @IsInt()
  order: number;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];

  @IsOptional()
  @IsString()
  changeSummary?: string;

  /** 클라이언트 로컬 기준 오늘 날짜 (타임존은 클라이언트가 안다) */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'clientToday는 YYYY-MM-DD 형식이어야 합니다',
  })
  clientToday: string;
}
