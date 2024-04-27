import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('search?:q')
  async handleSearch(@Param('q') q: string) {
    return this.chatService.handleSearch(q);
  }

  @Post('create-group')
  async createGroupChat(@Body() body: CreateGroupDto) {
    return this.chatService.createGroupChat(body);
  }

  @Get('group/list')
  async getAllGroupChat(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.chatService.getAllGroupChat(userId);
  }
  @Get('group/:id')
  async detailGroup(@Param('id') id: string) {
    return this.chatService.detailGroup(id);
  }
}
