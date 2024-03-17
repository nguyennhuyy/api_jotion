import { IsString } from 'class-validator';

export class DeleteItemDto {
  @IsString()
  id: string;
  @IsString()
  workCardId: string;
}
