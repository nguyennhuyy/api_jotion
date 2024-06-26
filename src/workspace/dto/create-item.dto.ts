import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateWorkItemDto {
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

  @IsOptional()
  date?: Date | null;

  @IsString()
  @IsMongoId()
  workListId: string;
}
