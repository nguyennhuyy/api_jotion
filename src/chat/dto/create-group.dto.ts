import { IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsOptional()
  name: string;

  @IsString()
  type: string;
  membersId: string[];
}
