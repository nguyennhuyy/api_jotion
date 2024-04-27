import { IsString } from 'class-validator';

export class LoginDto {
  fullname: string;
  password: string;
}

export class RegisterDto {
  @IsString()
  fullname: string;

  @IsString()
  password: string;
}
