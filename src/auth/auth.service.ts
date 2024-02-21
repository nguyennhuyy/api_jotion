import { JwtService } from '@nestjs/jwt';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UserLoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
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
}
