import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getInfo(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('user not found');
    delete user.password;
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log('updateUserDto', updateUserDto);
    return `This action updates a #${id} user`;
  }
}
