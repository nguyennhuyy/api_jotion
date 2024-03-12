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

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCol() {
    try {
      const works = await this.prisma.workSpaceCol.findMany({
        include: {
          work: true,
        },
      });
      return works;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async create(createWorkSpaceDto: CreateWorkSpaceDto) {
    try {
      const { title } = createWorkSpaceDto;
      if (!title)
        throw new HttpException('Yêu cầu có tiêu đề', HttpStatus.BAD_REQUEST);

      const space = await this.prisma.workSpaceCol.create({
        data: {
          title,
        },
      });

      return space;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: string) {
    try {
      if (!id)
        throw new HttpException('Yêu cầu có id cột', HttpStatus.BAD_REQUEST);
      const deleteCol = await this.prisma.workSpaceCol.delete({
        where: {
          id,
        },
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
      const { workSpaceColId } = body;
      if (!workSpaceColId)
        throw new HttpException('Bắt buộc có id cột', HttpStatus.BAD_REQUEST);

      const workCol = await this.prisma.workSpaceCol.findFirst({
        where: {
          id: workSpaceColId,
        },
      });

      if (!workCol) throw new NotFoundException('Không tìm thấy cột');

      const workCreate = await this.prisma.workSpace.create({
        data: body,
      });

      const workUpdate = await this.prisma.workSpaceCol.update({
        where: {
          id: workSpaceColId,
        },
        data: {
          work: {
            connect: {
              id: workCreate.id,
            },
          },
        },
        include: {
          work: true,
        },
      });
      return workUpdate;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteWorkItem(body: DeleteItemDto) {
    try {
      const { id, workColId } = body;
      if (!id || !workColId)
        throw new HttpException('Bắt buộc có id cột', HttpStatus.BAD_REQUEST);

      const workDelete = await this.prisma.workSpace.delete({
        where: {
          id,
          workSpaceColId: workColId,
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
}
