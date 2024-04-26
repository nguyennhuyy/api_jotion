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
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateCardInfoDto } from './dto/update-card-info.dto';

@UseGuards(AuthGuard)
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workSpaceService: WorkspaceService) {}

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

  @Get('/list/:id')
  async getWorkList(@Param('id') id: string) {
    return this.workSpaceService.getWorkList(id);
  }

  @Post('create-list')
  async createList(
    @Req() req: Request,
    @Body() createWorkSpaceDto: CreateWorkSpaceDto,
  ) {
    const userId = (req as any).user.id;
    return await this.workSpaceService.createList(userId, createWorkSpaceDto);
  }
  @Delete('list-delete/:id')
  async deleteList(@Param('id') id: string) {
    return this.workSpaceService.deleteList(id);
  }

  @Put('update-list')
  async updateList(@Body() body: UpdateListDto[]) {
    return this.workSpaceService.updateList(body);
  }

  @Post('create-card')
  async createCard(@Req() req: Request, @Body() body: CreateWorkItemDto) {
    const userId = (req as any).user.id;
    return this.workSpaceService.createCard(userId, body);
  }

  @Delete('delete-card/:id')
  async deleteCard(@Param('id') id: string) {
    return this.workSpaceService.deleteCard(id);
  }
  @Put('update-card')
  async updateCard(@Body() body: UpdateCardDto[]) {
    return this.workSpaceService.updateCard(body);
  }

  @Put('update-card-info')
  async updateCardInfo(@Body() body: UpdateCardInfoDto) {
    return this.workSpaceService.updateCardInfo(body);
  }
}
