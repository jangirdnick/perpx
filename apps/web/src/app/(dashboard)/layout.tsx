import ProtectedRoute from '../../lib/providers/auth.provider';
import LayoutNav from '../../modules/layout/components/navbar/layout.nav';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import { MessageBlockedIcon } from '@hugeicons/core-free-icons';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <LayoutNav />
        <div className="fixed top-0 z-2 w-full flex items-center justify-between p-2 bg-background border-b border-border md:hidden">
          <SidebarTrigger size="icon-lg" />
          <HugeiconsIcon icon={MessageBlockedIcon} size={14} />
        </div>
        <SidebarInset className="min-w-0 h-screen flex-1 overflow-hidden">{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
