import React from 'react';
import ProtectedRoute from '../../lib/providers/auth.provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
