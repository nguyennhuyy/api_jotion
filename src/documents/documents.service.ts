import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCoverDto } from './dto/update-cover.dto';
import { UpdatePublishDto } from './dto/update-publish.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}
  async getDetailDocument(id: string) {
    try {
      const documents = await this.prisma.documents.findFirst({
        where: {
          id,
        },
      });
      if (!documents) throw new NotFoundException('Không tồn tại tài liệu');
      return documents;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async removeCoverImage(id: string) {
    try {
      const document = await this.prisma.documents.update({
        where: {
          id,
        },
        data: {
          coverImage: null,
        },
      });
      return document;
    } catch (error) {
      console.log('error', error);
      throw new NotFoundException('Không tồn tại tài liệu');
    }
  }

  async updateCover(body: UpdateCoverDto) {
    try {
      const document = this.prisma.documents.update({
        where: {
          id: body.id,
        },
        data: {
          coverImage: body.coverImage,
        },
      });
      return document;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updatePublishDocument(body: UpdatePublishDto) {
    try {
      const document = this.prisma.documents.update({
        where: {
          id: body.id,
        },
        data: {
          isPublished: body.isPublished,
        },
      });
      return document;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
