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
        content: '',
        coverImage:
          'https://images.unsplash.com/photo-1543906965-f9520aa2ed8a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=4800',
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
      console.log('error', error);
    }
  }

  @SubscribeMessage('updateContentDocument')
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
      }, 2000);
    } catch (error) {
      console.log('error', error);
    }
  }
}
