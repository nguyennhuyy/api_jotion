import { IsString } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  id: string;
  @IsString()
  title: string;

  @IsString()
  avatar: string | null;

  @IsString()
  date: Date | null;

  order: number | null;

  tags: string[];

  @IsString()
  workListId: string;
  createdAt: Date;
  updatedAt: Date;
}
