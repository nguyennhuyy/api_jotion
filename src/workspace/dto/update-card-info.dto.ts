import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateCardInfoDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  avatars?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  date?: Date;
}
