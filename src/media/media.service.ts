import { BadRequestException, Injectable, UploadedFile } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Stream } from 'stream';

@Injectable()
export class MediaService {
  constructor(
    private readonly minioService: MinioService,
    private readonly cloudinary: CloudinaryService,
  ) {}
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

  async uploadFileCloud(@UploadedFile() file: Express.Multer.File) {
    try {
      const response = await this.cloudinary.uploadImage(file);
      return {
        url: response.url,
      };
    } catch (error) {
      throw new BadRequestException('File không đúng định dạng');
    }
  }
}
