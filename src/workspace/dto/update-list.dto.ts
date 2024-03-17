import { IsDate, IsNumber, IsString } from 'class-validator';

export class UpdateListDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  order: number;

  @IsString()
  userId: string;

  @IsString()
  boardId: string;

  cards: any;
  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
