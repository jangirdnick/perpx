'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import type { HugeiconsIconProps } from '@hugeicons/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '../../../../components/ui/sidebar';
import {
  AiMagicIcon,
  Clock02Icon,
  FoldersIcon,
  Layout07Icon,
  MessageMultiple01Icon,
  PlusSignCircleIcon,
} from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TooltipProvider } from '../../../../components/ui/tooltip';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import UserNav from './user-nav';
import { useGetUserChats } from '../../../chat/hooks/useChat';
import ActionButton from './action-button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { removeActiveChatId, setActiveChatId } from '@/modules/chat/slices/chatSlice';

const navItems: { lable: string; icon: HugeiconsIconProps['icon']; url: string }[] = [
  { lable: 'New', icon: PlusSignCircleIcon, url: '/' },
  { lable: 'Spaces', icon: FoldersIcon, url: '/spaces' },
  { lable: 'Artefacts', icon: Layout07Icon, url: '/artefacts' },
  { lable: 'History', icon: Clock02Icon, url: '/history' },
];

export default function LayoutNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const { data, isLoading, error } = useGetUserChats();
  const dispatch = useAppDispatch();
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);

  const activeChatIdFromUrl = searchParams.get('chatId');

  const handleGetChatMessages = (chatId: string) => {
    dispatch(setActiveChatId(chatId));
    router.push(`/?chatId=${chatId}`);
  };

  const handleResetChatId = () => {
    if (activeChatId) {
      dispatch(removeActiveChatId());
    }
  };

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        className="max-w-50 border-r border-sidebar-border bg-sidebar text-sm"
      >
        <SidebarHeader>
          <div
            className={cn(
              'group flex items-center justify-between',
              isCollapsed ? 'px-0.5' : 'px-2',
            )}
          >
            <Link
              href="/"
              onClick={handleResetChatId}
              className={cn(
                'flex min-w-0 items-center',
                isCollapsed && 'z-0 duration-300 ease-out group-hover:opacity-0',
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
                <HugeiconsIcon icon={AiMagicIcon} className="text-primary-foreground" />
              </div>
            </Link>

            <SidebarTrigger
              size="icon-lg"
              className={cn(
                isCollapsed && 'z-10 opacity-0 duration-300 ease-in group-hover:opacity-100',
              )}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col gap-4 overflow-hidden p-2">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.url && !activeChatIdFromUrl;

                return (
                  <SidebarMenuItem key={item.lable}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={handleResetChatId}
                      tooltip={item.lable}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md bg-transparent! px-2.5 py-2 text-sm text-muted-foreground! transition-colors',
                        'hover:bg-secondary!',
                        isActive && 'bg-secondary!',
                      )}
                    >
                      <Link href={item.url}>
                        <HugeiconsIcon icon={item.icon} size={16} className="shrink-0" />
                        <span>{item.lable}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          {!isCollapsed && (
            <SidebarGroup className="flex-1 min-h-0 p-0">
              <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Recent
              </p>

              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
                {error?.message && (
                  <p className="px-2.5 text-[11px] text-destructive">{error.message}</p>
                )}

                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="relative">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Skeleton className="h-5 w-full rounded-sm" />
                        <Skeleton className="h-5 w-8 rounded-sm" />
                      </div>
                    </div>
                  ))
                ) : !data?.success || data.data.chats.length === 0 ? (
                  <p className="truncate px-2.5 text-[11px] font-light text-muted-foreground">
                    No chats found
                  </p>
                ) : (
                  data.data.chats.map((chat) => {
                    const isActiveChat = activeChatIdFromUrl === chat.id;

                    return (
                      <div key={chat.id} className="group/chat-item relative rounded-md">
                        <Button
                          onClick={() => handleGetChatMessages(chat.id)}
                          variant="ghost"
                          className={cn(
                            'w-full justify-start pr-10 text-left transition-colors',
                            'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground/80',
                            isActiveChat && 'bg-sidebar-accent text-foreground',
                          )}
                        >
                          <HugeiconsIcon
                            icon={MessageMultiple01Icon}
                            size={8}
                            className={cn(
                              'shrink-0 transition-opacity',
                              isActiveChat
                                ? 'opacity-80'
                                : 'opacity-40 group-hover/chat-item::opacity-80',
                            )}
                          />
                          <span className="truncate text-ellipsis text-[11px] font-inter font-light">
                            {chat.title}
                          </span>
                        </Button>

                        <div className="pointer-events-none absolute inset-y-0 right-1 z-10 flex items-center opacity-0 transition-opacity group-hover/chat-item:opacity-100">
                          <div className="pointer-events-auto">
                            <ActionButton chatId={chat.id} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <UserNav isCollapsed={isCollapsed} />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
