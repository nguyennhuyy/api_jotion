import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, EventsGateway],
})
export class EventsModule {}
