// packages/shared/index.ts
import type { User } from './types/user.type';
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

export const test = 'hello from shared';
export type { User };
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
