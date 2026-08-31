import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HugeiconsIcon, HugeiconsIconProps } from '@hugeicons/react';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Clock02Icon, FoldersIcon, Images, PlusSignCircleIcon } from '@hugeicons/core-free-icons';

const navItems: { label: string; icon: HugeiconsIconProps['icon']; url: string }[] = [
  { label: 'New Chat', icon: PlusSignCircleIcon, url: '/' },
  { label: 'Spaces', icon: FoldersIcon, url: '/spaces' },
  { label: 'Images', icon: Images, url: '/images' },
  { label: 'History', icon: Clock02Icon, url: '/history' },
];

interface NavMenuProps {
  pathname: string;
  activeChatIdFromUrl: string | null;
  handleResetChatId: () => void;
}

export const NavMenu = memo(function NavMenu({
  pathname,
  activeChatIdFromUrl,
  handleResetChatId,
}: NavMenuProps) {
  return (
    <SidebarGroup className="p-0">
      <SidebarMenu className="gap-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.url && !activeChatIdFromUrl;

          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                onClick={handleResetChatId}
                tooltip={item.label}
                className={cn(
                  'flex items-center gap-2.5 rounded-md bg-transparent! p-2.5 text-sm text-foreground/80! transition-colors',
                  'hover:bg-secondary/70!',
                  isActive && 'bg-secondary/80! text-foreground!',
                )}
              >
                <Link href={item.url}>
                  <HugeiconsIcon icon={item.icon} size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
});
