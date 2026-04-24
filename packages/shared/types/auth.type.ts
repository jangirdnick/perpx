import { ResponseUser, User } from './user.type';

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
  data: object;
};

export type RegisterData = object;

export type LoginData = {
  user: ResponseUser;
  access_token: string;
};

export type GetMeData = {
  user: User;
};

export type RefreshTokenData = {
  access_token: string;
};

export type VerifyEmailData = object;
export type SendVerificationEmailData = object;

export type AuthRegisterResponse = ApiSuccessResponse<RegisterData> | ApiErrorResponse;
export type AuthLoginResponse = ApiSuccessResponse<LoginData> | ApiErrorResponse;
export type AuthGetMeResponse = ApiSuccessResponse<GetMeData> | ApiErrorResponse;
export type AuthRefreshTokenResponse = ApiSuccessResponse<RefreshTokenData> | ApiErrorResponse;
export type AuthVerifyEmailResponse = ApiSuccessResponse<VerifyEmailData> | ApiErrorResponse;
export type AuthSendVerificationEmailResponse =
  | ApiSuccessResponse<SendVerificationEmailData>
  | ApiErrorResponse;
export type AuthResponse = ApiSuccess | ApiErrorResponse;
