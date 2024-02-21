import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  fullname: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  password: string;
}
