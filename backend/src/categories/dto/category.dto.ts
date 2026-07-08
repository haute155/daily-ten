import { IsString, MaxLength, MinLength } from 'class-validator';

export class CategoryDto {
  @IsString()
  @MinLength(1, { message: '카테고리 이름을 입력해 주세요' })
  @MaxLength(10, { message: '카테고리 이름은 10자 이내로 해주세요' })
  label: string;
}
