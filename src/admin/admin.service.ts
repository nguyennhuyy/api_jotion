import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(userLogin: LoginDto) {
    const { fullname, password } = userLogin;
    const user = await this.prisma.admin.findFirst({
      where: {
        fullname,
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const isMatch = bcrypt.compareSync(password, user?.password);

    if (!isMatch) throw new UnauthorizedException('Mật khẩu không đúng');

    const payload = {
      fullname: userLogin.fullname,
      id: user.id,
      role: 'admin',
    };
    const accessToken = await this.jwtService.signAsync(payload);

    delete user.password;
    return {
      ...user,
      accessToken,
    };
  }
  async register(userRegister: RegisterDto) {
    const { fullname, password } = userRegister;
    const user = await this.prisma.admin.findFirst({
      where: {
        fullname,
      },
    });

    if (user)
      throw new HttpException('Người dùng đã tồn tại', HttpStatus.BAD_REQUEST);

    const hashPassword = await bcrypt.hash(password, 10);

    const userCreated = await this.prisma.admin.create({
      data: {
        ...userRegister,
        password: hashPassword,
      },
    });
    const payload = { fullname, id: userCreated.id, role: 'admin' };
    const accessToken = await this.generateToken(payload);

    delete userCreated.password;
    return {
      ...userCreated,
      accessToken,
    };
  }
  async generateToken(payload: { fullname: string; id: string; role: string }) {
    return this.jwtService.signAsync(payload);
  }

  async revenue() {
    const promiseDocs = await this.prisma.documents.count();
    const promiseWorks = await this.prisma.workList.count();
    const promiseUsers = await this.prisma.user.count();
    const promiseMessage = await this.prisma.message.count();

    const [docs, works, users, message] = await Promise.all([
      promiseDocs,
      promiseWorks,
      promiseUsers,
      promiseMessage,
    ]);

    return {
      users,
      docs,
      works,
      message,
    };
  }

  async allUser() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        avatar: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        typeLogin: true,
      },
    });
    return users;
  }

  async allDocuments() {
    const docs = await this.prisma.documents.findMany({});
    const documents = await Promise.all(
      docs.map(async (doc) => {
        const user = await this.prisma.user.findFirst({
          where: {
            id: doc?.userId,
          },
        });
        delete user.password;
        return {
          ...doc,
          userId: user,
        };
      }),
    );
    return documents;
  }

  async deleteDocument(id: string) {
    const doc = await this.prisma.documents.delete({
      where: {
        id,
      },
    });
    return doc;
  }

  async allWorkSpace() {
    const docs = await this.prisma.workBoard.findMany({});

    const documents = await Promise.all(
      docs.map(async (doc) => {
        const user = await this.prisma.user.findFirst({
          where: {
            id: doc?.userId,
          },
        });
        delete user.password;
        return {
          ...doc,
          userId: user,
        };
      }),
    );
    return documents;
  }

  async deleteWorkSpace(id: string) {
    const doc = await this.prisma.workBoard.delete({
      where: {
        id,
      },
    });
    return doc;
  }
}
