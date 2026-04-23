'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSessionExpired } from '@/modules/auth/slices/authSlice';

export default function AuthRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { sessionExpired, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && sessionExpired && pathname !== '/account/login') {
      dispatch(setSessionExpired(false));
      router.replace('/account/login');
    }
  }, [sessionExpired, loading, pathname, router, dispatch]);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname.startsWith('/dashboard')) {
      router.replace('/account/login');
    }
  }, [loading, isAuthenticated, pathname, router]);

  return null;
}
