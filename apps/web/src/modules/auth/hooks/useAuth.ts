'use client';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  getMeApi,
  loginApi,
  logoutAllDeviceApi,
  logoutApi,
  registerApi,
  sendNewVerifyEmailApi,
} from '../api/auth.api';
import { toast } from 'sonner';
import {
  AuthLoginResponse,
  AuthRegisterResponse,
  AuthResponse,
  AuthSendVerificationEmailResponse,
} from '@perpx/shared';
import { getErrorMessage } from '../api/auth.error.api';

export const useRegester = () => {
  const qureyClient = useQueryClient();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data: AuthRegisterResponse) => {
      if (data.success) {
        toast.success(data.message || 'Register successful. Please verify email.');
        qureyClient.invalidateQueries({ queryKey: ['session'] });
      } else {
        toast.error(data.message || data.error || 'Register failed.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useLogin = () => {
  const qureyClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data: AuthLoginResponse) => {
      if (data.success) {
        toast.success(data.message || '🎉 Login successfully.');
        qureyClient.invalidateQueries({ queryKey: ['session'] });
      } else {
        toast.error(data.message || data.error || 'Login failed.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useSendNewVerifyEmail = () => {
  return useMutation({
    mutationFn: sendNewVerifyEmailApi,
    onSuccess: (data: AuthSendVerificationEmailResponse) => {
      if (data.success) {
        toast.success(data.message || 'Send new email successful.');
      } else {
        toast.error(data.message || data.error || 'Send new Email failed.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: getMeApi,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

// export const useRefreshToken = () => {
//   const qureyClient = useQueryClient();
//   return useMutation({
//     mutationFn: refreshTokenApi,
//     onSuccess: (data: AuthRefreshTokenResponse) => {
//       if (data.success) {
//         qureyClient.invalidateQueries({ queryKey: ['refresh'] });
//       } else {
//         toast.error(data.error || data.message || 'Featching failed. Try again.');
//       }
//     },
//     onError: (err: unknown) => {
//       toast.error(getErrorMessage(err));
//     },
//   });
// };

export const useLogout = () => {
  const qureyClient = useQueryClient();
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: (data: AuthResponse) => {
      if (data.success) {
        qureyClient.clear();
        toast.success(data.message || 'Logout successful.');
        window.location.href = '/account/login';
      } else {
        toast.error(data.message || data.error || 'Logout failed.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useLogoutAllDevice = () => {
  const qureyClient = useQueryClient();
  return useMutation({
    mutationFn: logoutAllDeviceApi,
    onSuccess: (data: AuthResponse) => {
      if (data.success) {
        qureyClient.clear();
        toast.success(data.message || 'Logout all device successful.');
        window.location.href = '/account/login';
      } else {
        toast.error(data.message || data.error || 'Logout all device failed.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};
