'use client';

import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, MessageLock02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { removeActiveChatId } from '@/modules/chat/slices/chatSlice';
import { cn } from '../../../../lib/utils';

export default function MobileNav() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const dispatch = useAppDispatch();

  const handleNewChatClick = () => {
    dispatch(removeActiveChatId());
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-3.5 bg-background/80 backdrop-blur-md border-b border-border/50 md:hidden">
      {/* Left: Sidebar Toggle */}
      <div className="flex items-center gap-2">
        <SidebarTrigger
          size="icon-lg"
          className={cn(
            'h-9 w-9 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/80 transition-colors',
            !isCollapsed ? 'rotate-180' : '',
            'brightness-50 hover:brightness-100',
          )}
        />
      </div>

      {/* Right: Quick New Chat & User Profile */}
      <div className="flex items-center gap-2">
        <Link href="/" onClick={handleNewChatClick}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary text-foreground transition-colors cursor-pointer"
            title="New Chat"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={18} />
          </Button>
        </Link>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary text-foreground transition-colors"
          >
            <HugeiconsIcon icon={MessageLock02Icon} size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
