/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as moment from 'moment';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { CreateWorkItemDto } from './dto/create-item.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateCardInfoDto } from './dto/update-card-info.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';

{
  userIsRegistredOn: moment();
}
@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const cards = await this.prisma.workCard.findMany({
      where: {
        date: {
          gte: moment().add(7, 'hour').toDate(),
        },
        isSendMail: false,
      },
    });

    const promises = cards.map((card) => {
      if (!card.isSendMail) {
        console.log('>>>>>moment', moment().add(7, 'hour').toDate());
        return new Promise(async (resolve, reject) => {
          const fiveMinutesAgo = moment(card?.date).subtract(5, 'minutes');
          try {
            if (moment().add(7, 'hour').toDate() >= fiveMinutesAgo.toDate()) {
              const user = await this.prisma.user.findFirst({
                where: {
                  id: card?.userId,
                },
              });

              await this.mailerService.sendMail({
                to: user?.email,
                from: 'huy.reactjs@gmail.com',
                subject: 'Hết hạn công việc',
                text: 'welcome',
                html: `<h1>Bạn có công việc ${card?.title} sắp đến hạn. Hãy quay lại và kiểm tra công việc.</h1>
              ${!!card.content ? `<p>Công việc có nội dung: ${card.content}</p>` : ''}
              `,
              });

              const cardUpdate = await this.prisma.workCard.update({
                where: {
                  id: card.id,
                },
                data: {
                  isSendMail: true,
                },
              });
              resolve(cardUpdate);
            }
          } catch (error) {
            reject(error);
          }
        });
      }
    });
    console.log('>>>>>>>cronjob send notifcation card expried', cards);

    const promiseAll = await Promise.all(promises);
    return 'ok';
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

  async createCard(userId: string, body: CreateWorkItemDto) {
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
        data: {
          ...body,
          date: body?.date
            ? moment(body?.date).add(7, 'hour').format('YYYY-MM-DDTHH:mm:ssZ')
            : null,
          userId,
        },
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
