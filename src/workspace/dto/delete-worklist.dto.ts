import { IsString } from 'class-validator';

export class DeleteWorkListDto {
  @IsString()
  id: string;

  @IsString()
  boardId: string;
}
