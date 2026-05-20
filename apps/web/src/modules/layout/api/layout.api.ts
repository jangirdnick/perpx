import axios from 'axios';
import { api } from '../../../lib/axios';
import { S3UploadResponse } from '@perpx/shared/types/s3upload.type';

export async function getUploadURL(fileName: string, fileType: string): Promise<S3UploadResponse> {
  const { data } = await api.post('/upload/upload-url', { fileName, fileType });
  return data;
}

export async function uploadFile(url: string, file: File) {
  const response = await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
  return response;
}
