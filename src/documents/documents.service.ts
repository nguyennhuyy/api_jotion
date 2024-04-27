import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCoverDto } from './dto/update-cover.dto';
import { UpdatePublishDto } from './dto/update-publish.dto';
import { GeminiaiService } from 'src/geminiai/geminiai.service';
import { CommentDto } from './dto/comment.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiaiService,
  ) {}
  async getDetailDocument(id: string) {
    try {
      const documents = await this.prisma.documents.findFirst({
        where: {
          id,
        },
      });
      if (!documents) throw new NotFoundException('Không tồn tại tài liệu');

      const comments = await this.prisma.documentsComment.findMany({
        where: {
          documentId: documents?.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      const newComments = await Promise.all(
        comments.map(async (attr) => {
          if (attr?.userId) {
            const user = await this.prisma.user.findFirst({
              where: {
                id: attr?.userId,
              },
            });

            delete user?.password;
            return {
              ...attr,
              userId: user,
            };
          }
          return attr;
        }),
      );

      return {
        ...documents,
        comments: newComments,
      };
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

  async writeContentAI(prompt: string) {
    try {
      const chat = this.gemini.model.generateContent(prompt);
      const response = (await chat).response;
      const text = response.text();
      return text;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async comment(body: CommentDto) {
    let user;

    console.log('>>>>>>>body', body);
    const document = await this.prisma.documents.findFirst({
      where: {
        id: body?.documentId,
      },
    });

    if (!document) throw new NotFoundException('Không tìm workspace');

    if (body.userId) {
      user = await this.prisma.user.findFirst({
        where: {
          id: body?.userId,
        },
      });
    }

    const workComment = await this.prisma.documentsComment.create({
      data: {
        userId: user?.id || '',
        documentId: document.id,
        content: body?.content,
      },
    });

    return workComment;
  }
}
