import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { UpdateCoverDto } from './dto/update-cover.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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

  @Patch('update-cover/:id')
  @UseGuards(AuthGuard)
  async updateCover(@Param('id') id: string, @Body() body: UpdateCoverDto) {
    return this.documentsSerivce.updateCover(id, body);
  }
}