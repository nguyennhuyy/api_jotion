import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    MinioModule.register({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'TGqv6VlxWwnkVqNQNtkC',
      secretKey: 'tM4GJeZZ1J3AZTuneGDyg5tT0ubjmh2igDP6gjEA',
    }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
