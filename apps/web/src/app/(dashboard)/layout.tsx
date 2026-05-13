import React from 'react';
import ProtectedRoute from '../../lib/providers/auth.provider';
import LayoutNav from '../../modules/layout/components/navbar/layout.nav';
import { SidebarProvider } from '../../components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <LayoutNav />
        <main className="w-full h-screen flex-1 overflow-hidden">{children}</main>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
