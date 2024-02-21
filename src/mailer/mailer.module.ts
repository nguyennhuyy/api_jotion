import { Module } from '@nestjs/common';
import { MailerModule as MailModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.NAME_EMAIL,
          pass: process.env.PASS_EMAIL,
        },
      },
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
  ],
  exports: [MailModule],
})
export class MailerModule {}
