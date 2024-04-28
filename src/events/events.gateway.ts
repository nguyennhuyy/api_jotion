import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DeleteDocumentDto } from './dto/delete-document.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { UpdateTitleDto } from './dto/update-title.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { EventsGuard } from './events.guard';
import { ChatDto } from './dto/chat.dto';

type SocketImplements = Socket & {
  user: {
    email: string;
    id: string;
    iat: number;
  };
};

@UseGuards(EventsGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;

  afterInit() {}
  handleConnection() {}
  handleDisconnect() {}

  @SubscribeMessage('getDocument')
  async handleJoinRoom(client: SocketImplements): Promise<void> {
    const userId = client?.user?.id;
    client.join(userId);
    const documents = await this.prisma.documents.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        id: 'desc',
      },
    });
    this.server.to(userId).emit('getDocument', documents);
  }

  @SubscribeMessage('createDocument')
  async createDocument(
    @MessageBody() data: CreateDocumentDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.userId) return;

    client.join(data.userId);
    const user = await this.prisma.user.findFirst({
      where: { id: data.userId },
    });

    if (!user) return;
    const document = await this.prisma.documents.create({
      data: {
        title: 'Untitled',
        userId: user?.id,
        isArchived: false,
        isPublished: false,
        icon: null,
        content: null,
        coverImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    this.server.to(data.userId).emit('getDocument', document);
    return document;
  }

  @SubscribeMessage('deleteDocument')
  async deleteDocument(client: Socket, data: DeleteDocumentDto) {
    try {
      client.join(data.userId);
      const document = await this.prisma.documents.delete({
        where: {
          id: data.id,
        },
      });
      this.server.to(data.userId).emit('deleteDocument', document);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @SubscribeMessage('updateContentDocument')
  async updateContentDocument(_client: Socket, data: UpdateContentDto) {
    try {
      const content = await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const updatedContent = await this.prisma.documents.update({
              where: {
                id: data?.id,
                userId: data?.userId,
              },
              data: {
                content: data?.content,
              },
            });
            resolve(updatedContent);
          } catch (error) {
            reject(error);
          }
        }, 1500);
      });
      return content;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @SubscribeMessage('updateTitleDocument')
  async updateTitleDocument(client: Socket, data: UpdateTitleDto) {
    try {
      client.join(data?.userId);
      const content = await this.prisma.documents.update({
        where: {
          id: data?.id,
          userId: data?.userId,
        },
        data: {
          title: data.title,
        },
      });

      this.server.to(data.userId).emit('updateTitleDocument', content);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @SubscribeMessage('updateIconDocument')
  async updateIconDocument(client: Socket, data: UpdateIconDto) {
    try {
      client.join(data.userId);
      const content = await this.prisma.documents.update({
        where: {
          id: data.id,
          userId: data.userId,
        },
        data: {
          icon: data.icon,
        },
      });

      this.server.to(data.userId).emit('updateIconDocument', content);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @SubscribeMessage('connection')
  async connection() {
    console.log('>>>>>>>Connect');
  }

  @SubscribeMessage('onChat')
  async sendMessage(client: Socket, data: ChatDto) {
    console.log('>>>>>>data', data);
    try {
      const content = await this.prisma.message.create({
        data: {
          senderId: data.senderId,
          conversationId: data?.conversationId,
          message: data?.message,
        },
      });

      this.server.emit('onChat', content);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
