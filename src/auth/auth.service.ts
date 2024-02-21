import { JwtService } from '@nestjs/jwt';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

import { UserLoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRegisterDto } from './dto/register.dto';
import { OtpService } from 'src/otp/otp.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TypeMail } from './enum/enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private otp: OtpService,
  ) {}
  async login(userLogin: UserLoginDto) {
    const { email, password } = userLogin;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    const isMatch = bcrypt.compareSync(password, user?.password);

    if (!isMatch) throw new UnauthorizedException('password not must');

    const payload = { email: userLogin.email, id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    delete user.password;
    return {
      ...user,
      accessToken,
    };
  }
  async register(userRegister: UserRegisterDto) {
    const { email, password } = userRegister;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) throw new HttpException('user exists', HttpStatus.BAD_REQUEST);

    const hashPassword = await bcrypt.hash(password, 10);

    const userCreated = await this.prisma.user.create({
      data: {
        ...userRegister,
        password: hashPassword,
        typeLogin: '',
      },
    });
    const payload = { email, id: userCreated.id };
    const accessToken = await this.generateToken(payload);

    delete userCreated.password;
    return {
      ...userCreated,
      accessToken,
    };
  }

  async generateToken(payload: { email: string; id: string }) {
    return this.jwtService.signAsync(payload);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('email not found');

    const data = {
      email,
      type: TypeMail.FORGOT,
    };

    const otpSerivce = await this.otp.generatorOtp(data);

    this.mailerService.sendMail({
      to: email,
      from: 'huy.reactjs@gmail.com',
      subject: 'Testing Nest MailerModule ✔',
      text: 'welcome',
      html: `<p>mã otp của bạn là: ${JSON.stringify(otpSerivce.data.otp)}</p>`,
    });
    return new HttpException('send mail success', HttpStatus.OK);
  }
  async resetPassword(resetPassword: ResetPasswordDto) {
    const { email, otp, password } = resetPassword;
    const data = {
      email,
      type: TypeMail.FORGOT,
      otp,
      password,
    };

    const user = await this.prisma.user.findFirst({
      where: { email: resetPassword.email },
    });
    if (!user) throw new NotFoundException('user not found');

    const confirmCode = await this.otp.verify(data);

    if (!confirmCode)
      throw new HttpException('code not correct', HttpStatus.BAD_REQUEST);

    const update = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await bcrypt.hash(password, 10),
        updatedAt: new Date(),
      },
    });
    delete update.password;
    return update;
  }
}
