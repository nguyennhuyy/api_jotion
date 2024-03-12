import { IsOptional, IsString } from 'class-validator';

export class CreateWorkSpaceDto {
  @IsString()
  title: string;

  @IsOptional()
  work?: any;
}
