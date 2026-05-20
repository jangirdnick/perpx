import { ApiSuccessResponse, ApiErrorResponse } from './api.type';

export type S3UploadData = {
  signedUrl: string;
  fileUrl: string;
};

export type S3UploadResponse = ApiSuccessResponse<S3UploadData> | ApiErrorResponse;
