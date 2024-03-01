import { IsString } from 'class-validator';

export class DeleteDocumentDto {
  @IsString()
  userId: string;
  @IsString()
  id: string;
}
