import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadService {
  private s3: S3Client;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  async getPresignedUrl(fileName: string, fileType: string, userId: string) {
    const key = `users/${userId}/${Date.now()}-${fileName}`;

    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME')!,
      Key: key,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5,
    });

    return {
      success: true,
      data: {
        signedUrl,
        fileUrl: `https://${this.configService.get<string>('AWS_BUCKET_NAME')}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`,
      },
      message: 'Upload URL generated successfully',
    };
  }
}
