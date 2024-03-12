import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadFile(file);
  }

  @Post('upload-cloud')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileCloud(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadFileCloud(file);
  }
}
