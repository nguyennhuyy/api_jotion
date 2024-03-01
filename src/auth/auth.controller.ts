import { Body, Controller, Post } from '@nestjs/common';

import { LoginGoogleDto, UserLoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.auth.forgotPassword(email);
  }
  @Post('reset-password')
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.auth.resetPassword(resetPassword);
  }

  @Post('login-google')
  async loginGoogle(@Body() body: LoginGoogleDto) {
    return this.auth.loginGoogle(body);
  }
}
