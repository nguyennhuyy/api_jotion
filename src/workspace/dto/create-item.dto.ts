import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @IsDateString()
  @IsOptional()
  date?: Date;
  @IsString()
  @IsMongoId()
  workListId: string;
}
