import { IsString } from 'class-validator';

export class ChatDto {
  @IsString()
  senderId: string;
  @IsString()
  conversationId: string;
  @IsString()
  message: string;
}
