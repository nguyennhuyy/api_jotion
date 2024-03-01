import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { jwtConstants } from './constants';
import { OtpService } from 'src/otp/otp.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService],
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60d' },
    }),
    HttpModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
