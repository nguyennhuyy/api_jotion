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
  @UseGuards(EventsGuard)
  async handleJoinRoom(client: Socket, data: CreateDocumentDto): Promise<void> {
    client.join(data.userId);
    const documents = await this.prisma.documents.findMany({
      where: {
        userId: data.userId,
      },
      orderBy: {
        id: 'desc',
      },
    });
    this.server.to(data.userId).emit('getDocument', documents);
  }

  @SubscribeMessage('createDocument')
  @UseGuards(EventsGuard)
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
  @UseGuards(EventsGuard)
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
  @UseGuards(EventsGuard)
  async updateContentDocument(client: Socket, data: UpdateContentDto) {
    try {
      setTimeout(async () => {
        client.join(data.userId);
        const content = await this.prisma.documents.update({
          where: {
            id: data.id,
            userId: data.userId,
          },
          data: {
            content: data.content,
          },
        });

        return content;
      }, 1500);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @SubscribeMessage('updateTitleDocument')
  @UseGuards(EventsGuard)
  async updateTitleDocument(client: Socket, data: UpdateTitleDto) {
    try {
      client.join(data.userId);
      const content = await this.prisma.documents.update({
        where: {
          id: data.id,
          userId: data.userId,
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
  @UseGuards(EventsGuard)
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
}
