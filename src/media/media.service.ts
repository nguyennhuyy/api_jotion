import { Injectable, UploadedFile } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { Stream } from 'stream';

@Injectable()
export class MediaService {
  constructor(private readonly minioService: MinioService) {}
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      try {
        const bucketName = 'photos';
        const objectName = `${Date.now()}_${file.originalname}`;
        const bufferStream = new Stream.PassThrough();
        bufferStream.end(file.buffer);

        this.minioService.client.putObject(
          bucketName,
          objectName,
          bufferStream,
          file.size,
          {
            'Content-Type': file.mimetype,
          },
        );

        const result = {
          url: `http://${process.env.HOST_MEDIA}/${bucketName}/${objectName}`,
        };
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
