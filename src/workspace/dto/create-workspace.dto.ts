import { IsString } from 'class-validator';

export class CreateWorkSpaceDto {
  @IsString()
  title: string;

  @IsString()
  boardId: string;
}
