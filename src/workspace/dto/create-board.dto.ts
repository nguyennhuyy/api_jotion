import { IsOptional, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title: string;
  @IsString()
  @IsOptional()
  imageThumb?: string;
}
