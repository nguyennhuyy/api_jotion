import { IsBoolean, IsString } from 'class-validator';

export class UpdatePublishDto {
  @IsString()
  id: string;

  @IsBoolean()
  isPublished: boolean;
}
