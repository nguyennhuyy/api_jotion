import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { UpdateCoverDto } from './dto/update-cover.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdatePublishDto } from './dto/update-publish.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsSerivce: DocumentsService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async getDetailDocument(@Param('id') id: string) {
    return this.documentsSerivce.getDetailDocument(id);
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  async removeCoverImage(@Param('id') id: string) {
    return this.documentsSerivce.removeCoverImage(id);
  }

  @Put('update-cover')
  @UseGuards(AuthGuard)
  async updateCover(@Body() body: UpdateCoverDto) {
    return this.documentsSerivce.updateCover(body);
  }

  @Get('public/:id')
  async getPublicDetailDocument(@Param('id') id: string) {
    return this.documentsSerivce.getDetailDocument(id);
  }

  @Patch('public/update')
  async updatePublishDocument(@Body() body: UpdatePublishDto) {
    return this.documentsSerivce.updatePublishDocument(body);
  }
  @Post('/ai-content')
  async writeContentAI(@Body('prompt') prompt: string) {
    return this.documentsSerivce.writeContentAI(prompt);
  }
}
