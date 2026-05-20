import React from 'react';
import ProtectedRoute from '../../lib/providers/auth.provider';
import LayoutNav from '../../modules/layout/components/navbar/layout.nav';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { cn } from '../../lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { MessageBlockedIcon } from '@hugeicons/core-free-icons';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <LayoutNav />
        <div className="fixed top-0 z-2 w-full flex items-center justify-between p-2  bg-background/40 backdrop-blur-md md:hidden">
          <SidebarTrigger size="icon-lg" />
          <HugeiconsIcon icon={MessageBlockedIcon} size={14} />
        </div>
        <div className="w-full h-screen flex-1 overflow-hidden">{children}</div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
