// packages/shared/index.ts
import type { User, UpdateUserRequest, UpdateUserResponse } from './types/user.type';
import type {
  AuthRegisterResponse,
  AuthLoginResponse,
  AuthGetMeResponse,
  AuthRefreshTokenResponse,
  AuthVerifyEmailResponse,
  AuthSendVerificationEmailResponse,
  AuthResponse,
} from './types/auth.type';

import type { ApiErrorResponse } from './types/api.type';

export * from './types/chat.type';
export * from './types/message.type';
export * from './types/s3upload.type';
export * from './types/space.type';

export const test = 'hello from shared';
export type { User, UpdateUserRequest, UpdateUserResponse };
export type {
  AuthRegisterResponse,
  AuthLoginResponse,
  AuthGetMeResponse,
  AuthRefreshTokenResponse,
  AuthVerifyEmailResponse,
  AuthSendVerificationEmailResponse,
  AuthResponse,
  ApiErrorResponse,
};
