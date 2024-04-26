import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('search?:q')
  async handleSearch(@Param('q') q: string) {
    return this.chatService.handleSearch(q);
  }
}
