import { ResponseUser, User } from './user.type';
import { ApiSuccess, ApiSuccessResponse, ApiErrorResponse } from './api.type'


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
