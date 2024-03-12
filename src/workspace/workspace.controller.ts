import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkSpaceDto } from './dto/create-workspace.dto';
import { CreateWorkItemDto } from './dto/create-item.dto';
import { DeleteItemDto } from './dto/delete-item.dto';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workSpaceService: WorkspaceService) {}

  @Get()
  async getAllCol() {
    return this.workSpaceService.getAllCol();
  }

  @Post('create')
  async create(@Body() createWorkSpaceDto: CreateWorkSpaceDto) {
    return await this.workSpaceService.create(createWorkSpaceDto);
  }
  @Delete('delete')
  async delete(@Body('id') id: string) {
    return this.workSpaceService.delete(id);
  }

  @Post('create-item')
  async createWorkItem(@Body() body: CreateWorkItemDto) {
    return this.workSpaceService.createWorkItem(body);
  }
  @Delete('delete-item')
  async deleteWorkItem(@Body() body: DeleteItemDto) {
    return this.workSpaceService.deleteWorkItem(body);
  }
}
