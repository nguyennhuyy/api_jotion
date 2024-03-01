import { IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  userId: string;
}

export class GetParentDocumentDto extends CreateDocumentDto {
  @IsString()
  roomName: string;
}
