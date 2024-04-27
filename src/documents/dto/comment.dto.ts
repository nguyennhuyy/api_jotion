import { IsOptional, IsString } from 'class-validator';

export class CommentDto {
  @IsOptional()
  userId: string;
  @IsString()
  documentId: string;
  @IsString()
  content: string;
}
