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
  ApiErrorResponse,
} from './types/auth.type';

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
