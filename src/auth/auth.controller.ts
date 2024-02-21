import { Body, Controller, Post } from '@nestjs/common';
import { UserLoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login')
  async login(@Body() userLogin: UserLoginDto) {
    return this.auth.login(userLogin);
  }

  @Post('register')
  async register(@Body() userRegister: UserRegisterDto) {
    return this.auth.register(userRegister);
  }
}
