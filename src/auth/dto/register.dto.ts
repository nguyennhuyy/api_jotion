import { IsEmail, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsString()
  password: string;
}
