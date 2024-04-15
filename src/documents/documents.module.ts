import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeminiaiService } from 'src/geminiai/geminiai.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, GeminiaiService],
})
export class DocumentsModule {}
