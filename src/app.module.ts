import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { OtpModule } from './otp/otp.module';
@Module({
  imports: [PrismaModule, UsersModule, AuthModule, MailerModule, OtpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
