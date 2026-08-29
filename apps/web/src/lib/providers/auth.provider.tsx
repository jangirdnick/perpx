'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { SessionLoader } from '@/components/shared/session-loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/account/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <SessionLoader message="Authenticating session..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}
