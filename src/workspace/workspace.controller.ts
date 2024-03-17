import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { CreateWorkItemDto } from './dto/create-item.dto';
import { DeleteItemDto } from './dto/delete-item.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateBoardDto } from './dto/create-board.dto';
import { DeleteWorkListDto } from './dto/delete-worklist.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workSpaceService: WorkspaceService) {}

  @Get('/list/:id')
  async getWorkList(@Param('id') id: string) {
    return this.workSpaceService.getWorkList(id);
  }

  @Post('create-board')
  async createBoard(@Req() req: Request, @Body() body: CreateBoardDto) {
    const userId = (req as any).user.id;
    return this.workSpaceService.createBoard(userId, body);
  }
  @Get('boards')
  async getBoard(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.workSpaceService.getBoard(userId);
  }

  @Post('create-list')
  async create(
    @Req() req: Request,
    @Body() createWorkSpaceDto: CreateWorkSpaceDto,
  ) {
    const userId = (req as any).user.id;
    return await this.workSpaceService.create(userId, createWorkSpaceDto);
  }
  @Delete('delete')
  async delete(@Body() body: DeleteWorkListDto) {
    return this.workSpaceService.delete(body);
  }

  @Post('create-item')
  async createWorkItem(@Body() body: CreateWorkItemDto) {
    return this.workSpaceService.createWorkItem(body);
  }

  @Delete('delete-item')
  async deleteWorkItem(@Body() body: DeleteItemDto) {
    return this.workSpaceService.deleteWorkItem(body);
  }

  @Put('update-list')
  async updateList(@Body() body: UpdateListDto[]) {
    return this.workSpaceService.updateList(body);
  }

  @Put('update-card')
  async updateCard(@Body() body: UpdateCardDto[]) {
    return this.workSpaceService.updateCard(body);
  }
}
