import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { CreateWorkItemDto } from './dto/create-item.dto';
import { DeleteItemDto } from './dto/delete-item.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { DeleteWorkListDto } from './dto/delete-worklist.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

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
  async create(userId: string, createWorkSpaceDto: CreateWorkSpaceDto) {
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

  async delete(body: DeleteWorkListDto) {
    try {
      const deleteCol = await this.prisma.workList.delete({
        where: body,
      });
      return {
        message: `Xoá thành công cột ${deleteCol.title}`,
        data: deleteCol,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async createWorkItem(body: CreateWorkItemDto) {
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

  async deleteWorkItem(body: DeleteItemDto) {
    try {
      const { id, workCardId } = body;
      if (!id || !workCardId)
        throw new HttpException('Bắt buộc có id cột', HttpStatus.BAD_REQUEST);

      const workDelete = await this.prisma.workCard.delete({
        where: {
          id,
          workListId: workCardId,
        },
      });

      return {
        message: `Xoá thành công workspace ${workDelete.title}`,
        data: workDelete,
      };
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
          },
        }),
      );
      const updateBoard = this.prisma.$transaction(transaction);

      return updateBoard;
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
          },
        }),
      );
      const updateCard = this.prisma.$transaction(transaction);
      return updateCard;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
