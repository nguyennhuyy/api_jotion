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
import { HttpService } from '@nestjs/axios';

import { LoginGoogleDto, UserLoginDto } from './dto/login.dto';
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
    private readonly axios: HttpService,
  ) {}
  async login(userLogin: UserLoginDto) {
    const { email, password } = userLogin;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const isMatch = bcrypt.compareSync(password, user?.password);

    if (!isMatch) throw new UnauthorizedException('Mật khẩu không đúng');

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

    if (user)
      throw new HttpException('Người dùng đã tồn tại', HttpStatus.BAD_REQUEST);

    const hashPassword = await bcrypt.hash(password, 10);

    const userCreated = await this.prisma.user.create({
      data: {
        ...userRegister,
        password: hashPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
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

    if (!user) throw new NotFoundException('Không tìm thấy email');

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
    return new HttpException('Gửi OTP thành công', HttpStatus.OK);
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
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const confirmCode = await this.otp.verify(data);

    if (!confirmCode)
      throw new HttpException('Code không đúng', HttpStatus.BAD_REQUEST);

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

  generateNameGoogle(email: string) {
    return email.split('@')[0];
  }
  async loginGoogle(body: LoginGoogleDto) {
    const { accessToken } = body;
    const userGoogle: any = {};
    const google = await this.axios.axiosRef.post(
      `https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=${accessToken}`,
    );

    if (google) {
      userGoogle.email = google.data.email;
      userGoogle.fullname = this.generateNameGoogle(google.data.email);
      userGoogle.typeLogin = 'google';
      userGoogle.userId = google.data.user_id;
      userGoogle.password = await bcrypt.hash(google.data.user_id, 10);
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: google.data.email,
      },
    });

    const payload = {
      id: user.id,
      email: user.email,
    };

    if (user) {
      delete user.password;
      return {
        ...user,
        accessToken: await this.generateToken(payload),
      };
    }

    const userCreate = await this.prisma.user.create({
      data: {
        ...userGoogle,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const payloadNew = {
      id: userCreate.id,
      email: google.data.email,
    };

    this.mailerService.sendMail({
      to: google.data.email,
      from: 'huy.reactjs@gmail.com',
      subject: 'Đăng ký thành công trên Jotion',
      text: 'welcome',
      html: `Chúc mừng bạn đã trở thành thành viên của Jotion. Chúc bạn có trải nghiệm tốt nhất`,
    });

    delete userCreate.password;
    return { ...userCreate, accessToken: await this.generateToken(payloadNew) };
  }
}
