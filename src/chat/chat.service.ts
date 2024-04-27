import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}
  async handleSearch(q: string) {
    try {
      const user = await this.prisma.user.findMany({
        where: {
          fullname: {
            contains: q,
          },
        },
      });
      return user;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createGroupChat(body: CreateGroupDto) {
    const group = await this.prisma.messageGroup.create({
      data: {
        name: body?.name,
        // userId: body?.userId,
      },
    });

    return group;
  }
  async getAllGroupChat(userId: string) {
    // const messages = await this.prisma.messageGroup.findMany({
    //   where: {
    //     userId,
    //   },
    // });
    // return messages;
    return userId;
  }

  async detailGroup(id: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        groupId: id,
      },
    });

    return messages;
  }
}
