import { IsArray, IsString } from 'class-validator';

export class UpsertEntryDto {
  @IsArray()
  @IsString({ each: true })
  checkedItemIds: string[];

  @IsString()
  note: string;
}
