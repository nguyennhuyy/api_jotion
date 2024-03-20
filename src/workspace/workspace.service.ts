import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { CreateWorkItemDto } from './dto/create-item.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateCardInfoDto } from './dto/update-card-info.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async createBoard(userId: string, body: CreateBoardDto) {
    const board = await this.prisma.workBoard.create({
      data: {
        userId,
        ...body,
      },
    });
    return board;
  }

  async getBoard(userId: string) {
    try {
      const boards = await this.prisma.workBoard.findMany({
        where: {
          userId,
        },
      });
      return boards;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getWorkList(id: string) {
    try {
      const board = await this.prisma.workBoard.findFirst({
        where: {
          id,
        },
      });

      const list = await this.prisma.workList.findMany({
        where: {
          boardId: id,
        },

        include: {
          cards: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      });
      return {
        board,
        list,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createList(userId: string, createWorkSpaceDto: CreateWorkSpaceDto) {
    try {
      const list = await this.prisma.workList.create({
        data: {
          userId,
          order: null,
          ...createWorkSpaceDto,
        },
      });

      return list;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteList(id: string) {
    try {
      const deleteList = this.prisma.workList.delete({
        where: {
          id,
        },
      });
      const deleteCard = this.prisma.workCard.deleteMany({
        where: {
          workListId: id,
        },
      });
      const transaction = await this.prisma.$transaction([
        deleteCard,
        deleteList,
      ]);
      return transaction;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createCard(body: CreateWorkItemDto) {
    try {
      const { workListId } = body;
      if (!workListId)
        throw new HttpException('Bắt buộc có id cột', HttpStatus.BAD_REQUEST);

      const workCol = await this.prisma.workList.findFirst({
        where: {
          id: workListId,
        },
      });

      if (!workCol) throw new NotFoundException('Không tìm thấy cột');

      const workCreate = await this.prisma.workCard.create({
        data: body,
      });

      const workUpdate = await this.prisma.workList.update({
        where: {
          id: workListId,
        },
        data: {
          cards: {
            connect: {
              id: workCreate.id,
            },
          },
        },
        include: {
          cards: true,
        },
      });
      return workUpdate;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCard(id: string) {
    try {
      const workDelete = await this.prisma.workCard.delete({
        where: {
          id,
        },
      });

      return workDelete;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCard(body: UpdateCardDto[]) {
    try {
      const transaction = body.map((card) =>
        this.prisma.workCard.update({
          where: {
            id: card.id,
          },
          data: {
            order: card.order,
            workListId: card.workListId,
            updatedAt: new Date(),
          },
        }),
      );
      const updateCard = this.prisma.$transaction(transaction);
      return updateCard;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateList(body: UpdateListDto[]) {
    try {
      const transaction = body.map((list) =>
        this.prisma.workList.update({
          where: {
            id: list.id,
            boardId: list.boardId,
          },
          data: {
            order: list.order,
            updatedAt: new Date(),
          },
        }),
      );
      const updateBoard = this.prisma.$transaction(transaction);

      return updateBoard;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCardInfo(body: UpdateCardInfoDto) {
    const { id, ...rest } = body;
    const card = await this.prisma.workCard.update({
      where: { id },
      data: {
        ...rest,
        updatedAt: new Date(),
      },
    });

    return card;
  }
}
