import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpsertEntryDto {
  @IsArray()
  @IsString({ each: true })
  checkedItemIds: string[];

  @IsString()
  note: string;

  /** 사용자가 명시적으로 선택한 레시피 버전 (미지정 시 서버 규칙으로 결정) */
  @IsOptional()
  @IsString()
  checklistVersionId?: string;
}
