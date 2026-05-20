import {
  AuthGetMeResponse,
  AuthLoginResponse,
  AuthRefreshTokenResponse,
  AuthRegisterResponse,
} from '@perpx/shared';
import { api } from '../../../lib/axios';

export interface RegisterPayload {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SendVerifyEmailPayload {
  email: string;
}

export async function registerApi(formData: FormData): Promise<AuthRegisterResponse> {
  const { data } = await api.post('/auth/register', formData);
  return data;
}

export async function loginApi(formData: FormData): Promise<AuthLoginResponse> {
  const { data } = await api.post('/auth/login', formData);
  return data;
}

export async function getMeApi(): Promise<AuthGetMeResponse> {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function refreshTokenApi(): Promise<AuthRefreshTokenResponse> {
  const { data } = await api.post('/auth/refresh');
  return data;
}

export async function sendNewVerifyEmailApi(formData: FormData) {
  const { data } = await api.post('/auth/send/verification-email', formData);
  return data;
}

export async function logoutApi() {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function logoutAllDeviceApi() {
  const { data } = await api.post('/auth/logout-all');
  return data;
}
