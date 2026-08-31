'use client';

import { useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeActiveChatId } from '@/modules/chat/slices/chatSlice';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '../../../../components/ui/sidebar';
import { TooltipProvider } from '../../../../components/ui/tooltip';

import UserNav from './user-nav';
import SettingsDialog from '../settings/settings-dialog';
import { NavHeader } from './parts/nav-header';
import { NavMenu } from './parts/nav-menu';
import { NavHistory } from './parts/nav-history';

export default function LayoutNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const isCollapsed = state === 'collapsed';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeChatId = useAppSelector((rootState) => rootState.chat.activeChatId);
  const activeChatIdFromUrl = searchParams.get('chatId');

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const handleResetChatId = useCallback(() => {
    if (activeChatId) {
      dispatch(removeActiveChatId());
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [activeChatId, dispatch, isMobile, setOpenMobile]);

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border text-sm z-999!">
        <NavHeader isCollapsed={isCollapsed} handleResetChatId={handleResetChatId} />

        <SidebarContent className="flex flex-col gap-4 overflow-hidden p-2 pr-0.5 mt-2 space-y-4">
          <NavMenu
            pathname={pathname}
            activeChatIdFromUrl={activeChatIdFromUrl}
            handleResetChatId={handleResetChatId}
          />

          {!isCollapsed && (
            <NavHistory
              isMobile={isMobile}
              setOpenMobile={setOpenMobile}
              activeChatIdFromUrl={activeChatIdFromUrl}
            />
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-accent p-0">
          <UserNav isCollapsed={isCollapsed} onOpenSettings={handleOpenSettings} />
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </TooltipProvider>
  );
}
