'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { SessionLoader } from '@/components/shared/session-loader';

interface GuestProviderProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function GuestProvider({ children, redirectTo = '/' }: GuestProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Sirf jab bootstrap complete ho aur user authenticated ho
    if (!loading && isAuthenticated && user && pathname !== redirectTo && !redirected.current) {
      redirected.current = true;
      router.replace(redirectTo);
    }
  }, [loading, isAuthenticated, user, pathname, redirectTo, router]);

  // Bootstrap chal raha hai to wait karo
  if (loading) {
    return <SessionLoader message="Checking session..." />;
  }

  // User already logged in hai to kuch mat dikhao
  if (isAuthenticated && user) {
    return null;
  }

  return <>{children}</>;
}
