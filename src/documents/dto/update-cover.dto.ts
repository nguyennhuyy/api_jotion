import { IsString } from 'class-validator';

export class UpdateCoverDto {
  @IsString()
  coverImage: string;
}
