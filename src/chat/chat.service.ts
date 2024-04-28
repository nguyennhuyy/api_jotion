import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          membersId: {
            hasEvery: body.membersId,
          },
        },
      });

      if (conversation) {
        return conversation;
      } else {
        const group = await this.prisma.conversation.create({
          data: {
            name: body?.name,
            type: body?.type,
            membersId: body?.membersId,
          },
        });

        return group;
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllGroupChat(userId: string) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          membersId: {
            hasEvery: [userId],
          },
        },
      });

      const conversationsGroup = await Promise.all(
        conversations.map(async (attr) => {
          if (attr.membersId.includes(userId)) {
            const user = await this.prisma.user.findFirst({
              where: {
                id: attr.membersId.find((user) => user !== userId),
              },
              select: {
                id: true,
                avatar: true,
                email: true,
                address: true,
                fullname: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
              },
            });
            return {
              ...attr,
              membersId: user,
            };
          }
          return attr;
        }),
      );

      return conversationsGroup;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async detailGroup(id: string, userId: string) {
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id,
        },
        select: {
          membersId: true,
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!conversation)
        throw new NotFoundException('Không tìm thấy người dùng');
      const otherMemberId = conversation.membersId.find(
        (user) => user !== userId,
      );
      const userInfo = await this.prisma.user.findFirst({
        where: {
          id: otherMemberId,
        },
        select: {
          id: true,
          avatar: true,
          email: true,
          address: true,
          fullname: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        ...userInfo,
        messages: conversation.messages,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
