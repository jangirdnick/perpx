import ProtectedRoute from '../../lib/providers/auth.provider';
import LayoutNav from '../../modules/layout/components/navbar/layout.nav';
import MobileNav from '../../modules/layout/components/navbar/mobile.nav';
import { SidebarInset, SidebarProvider } from '../../components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <LayoutNav />
        <MobileNav />
        <SidebarInset className="min-w-0 h-screen flex-1 overflow-hidden">{children}</SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
