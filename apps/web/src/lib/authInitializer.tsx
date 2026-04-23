// components/providers/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useGetMe } from '../modules/auth/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import {
  logout,
  setAuthBootstrapComplete,
  setIsAuthenticated,
  setUser,
} from '@/modules/auth/slices/authSlice';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isError, isFetched } = useGetMe();

  // First /auth/me complete hone par bootstrap complete
  useEffect(() => {
    if (isFetched) {
      dispatch(setAuthBootstrapComplete());
    }
  }, [isFetched, dispatch]);

  useEffect(() => {
    if (isSuccess && data?.success && data.data.user) {
      dispatch(setUser(data.data.user));
      dispatch(setIsAuthenticated(true));
    }
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(logout());
    }
  }, [isError, dispatch]);

  return null;
}
