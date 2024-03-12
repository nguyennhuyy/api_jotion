import { IsString } from 'class-validator';

export class UpdateTitleDto {
  @IsString()
  userId: string;
  @IsString()
  id: string;
  @IsString()
  title: string;
}
