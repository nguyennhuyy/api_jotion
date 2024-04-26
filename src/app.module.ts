import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { OtpModule } from './otp/otp.module';
import { MediaModule } from './media/media.module';
import { EventsModule } from './events/events.module';
import { DocumentsModule } from './documents/documents.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { GeminiaiModule } from './geminiai/geminiai.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    MailerModule,
    OtpModule,
    MediaModule,
    EventsModule,
    DocumentsModule,
    CloudinaryModule,
    WorkspaceModule,
    GeminiaiModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    moment.locale('vi');
    moment.tz.setDefault('Asia/Ho_Chi_Minh');
  }
}
