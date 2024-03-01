import { IsOptional, IsString } from 'class-validator';

export class UpdateContentDto {
  @IsString()
  userId: string;
  @IsString()
  id: string;
  @IsOptional()
  content: any;
}
