import { IsString } from 'class-validator';

export class UpdateIconDto {
  @IsString()
  userId: string;
  @IsString()
  id: string;
  @IsString()
  icon: string;
}
