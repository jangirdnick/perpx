// src/lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AppStore } from '../store';
import {
  logout,
  setAccessToken,
  setIsAuthenticated,
  setSessionExpired,
} from '../modules/auth/slices/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupInterceptors = (store: AppStore) => {
  api.interceptors.request.use(
    (config) => {
      const accessToken = store.getState().auth.access_token;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryAxiosRequestConfig;
      const status = error.response?.status;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const isRefreshCall = originalRequest.url?.includes('/auth/refresh');
      const isLoginCall = originalRequest.url?.includes('/auth/login');
      const isRegisterCall = originalRequest.url?.includes('/auth/register');

      if (status !== 401 || isRefreshCall || isLoginCall || isRegisterCall) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data?.data?.access_token;

        if (!newAccessToken) {
          throw new Error('New access token not found');
        }

        store.dispatch(setAccessToken(newAccessToken));
        store.dispatch(setIsAuthenticated(true));

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());

        store.dispatch(setSessionExpired(true));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};
