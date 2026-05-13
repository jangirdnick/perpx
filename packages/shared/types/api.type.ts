export type ApiErrorResponse = {
  success: false;
  message: string;
  error: string;
  statusCode: number;
};

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiSuccess = {
  success: true;
  message: string;
  data: Record<string, unknown>;
};