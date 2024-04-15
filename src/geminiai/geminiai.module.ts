import { Module } from '@nestjs/common';
import { GeminiaiService } from './geminiai.service';

@Module({
  providers: [GeminiaiService],
  exports: [GeminiaiService],
})
export class GeminiaiModule {}
