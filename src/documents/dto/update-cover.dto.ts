import { IsString } from 'class-validator';

export class UpdateCoverDto {
  @IsString()
  id: string;
  @IsString()
  coverImage: string;
}
