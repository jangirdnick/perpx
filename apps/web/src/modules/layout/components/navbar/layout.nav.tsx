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
import { Clock02Icon, FoldersIcon, Images, PlusSignCircleIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TooltipProvider } from '../../../../components/ui/tooltip';
import { cn } from '../../../../lib/utils';
import { Button } from '../../../../components/ui/button';
import UserNav from './user-nav';
import { useGetSidebarUserChats } from '../../../chat/hooks/useChat';
import ActionButton from './action-button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { removeActiveChatId, setActiveChatId } from '@/modules/chat/slices/chatSlice';
import { useMemo } from 'react';
import { Chat } from '@perpx/shared/types/chat.type';

const navItems: { lable: string; icon: HugeiconsIconProps['icon']; url: string }[] = [
  { lable: 'New Chat', icon: PlusSignCircleIcon, url: '/' },
  { lable: 'Spaces', icon: FoldersIcon, url: '/spaces' },
  { lable: 'Images', icon: Images, url: '/images' },
  { lable: 'History', icon: Clock02Icon, url: '/history' },
];

export default function LayoutNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const { data, isLoading, error } = useGetSidebarUserChats();
  const dispatch = useAppDispatch();
  const activeChatId = useAppSelector((state) => state.chat.activeChatId);

  const activeChatIdFromUrl = searchParams.get('chatId');

  const { todayChats, earlierChats } = useMemo(() => {
    if (!data?.success || !data.data.chats) {
      return { todayChats: [], earlierChats: [] };
    }
    const today = new Date();
    const todayList: Chat[] = [];
    const earlierList: Chat[] = [];

    const sortedChats = [...data.data.chats].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    sortedChats.forEach((chat) => {
      const date = new Date(chat.updatedAt);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      if (isToday) {
        todayList.push(chat);
      } else {
        earlierList.push(chat);
      }
    });

    return { todayChats: todayList, earlierChats: earlierList };
  }, [data]);

  const handleGetChatMessages = (chatId: string) => {
    dispatch(setActiveChatId(chatId));
    if (isMobile) {
      setOpenMobile(false);
    }
    router.push(`/?chatId=${chatId}`);
  };

  const handleResetChatId = () => {
    if (activeChatId) {
      dispatch(removeActiveChatId());
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderChatItem = (chat: Chat) => {
    const isActiveChat = activeChatIdFromUrl === chat.id;

    return (
      <div key={chat.id} className="group/chat-item relative rounded-md space-y-0.5">
        <Button
          onClick={() => handleGetChatMessages(chat.id)}
          variant="ghost"
          className={cn(
            'w-full h-fit justify-start py-2 pr-5 text-left',
            'text-foreground/80 hover:bg-secondary hover:text-foreground',
            isActiveChat && 'bg-secondary/80 text-foreground',
          )}
        >
          <span className="truncate text-ellipsis text-sm font-inter font-light tracking-wide">
            {chat.title}
          </span>
        </Button>

        <div className="pointer-events-none absolute inset-y-0 right-1 z-10 flex items-center opacity-0 transition-opacity group-hover/chat-item:opacity-100">
          <div className="pointer-events-auto">
            <ActionButton chat={chat} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border text-sm z-999!">
        <SidebarHeader>
          <div
            className={cn(
              'group flex items-center justify-between mt-1.5',
              isCollapsed ? 'px-0.5' : 'px-1.5',
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
              <div className="flex h-8 w-8 shrink-0 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 192 176"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="size-8 text-foreground"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="
      M148 27
      L144 25
      L139 25
      L137 27
      L137 30
      L139 32
      L143 32
      L146 35
      L146 42
      L138 60
      L126 78
      L116 90
      L91 115
      L69 132
      L49 143
      L46 143
      L43 145
      L36 145
      L33 142
      L33 135
      L39 121
      L41 120
      L48 128
      L52 127
      L53 125
      L52 122
      L45 113
      L39 96
      L39 81
      L41 77
      L41 73
      L49 58
      L58 49
      L68 42
      L68 39
      L66 37
      L63 37
      L54 43
      L44 53
      L36 66
      L36 69
      L34 72
      L34 76
      L32 80
      L32 97
      L34 101
      L34 105
      L36 108
      L36 112
      L28 127
      L28 130
      L26 134
      L26 143
      L31 150
      L35 152
      L44 152
      L48 150
      L51 150
      L65 142
      L70 142
      L73 144
      L77 144
      L82 146
      L97 146
      L112 142
      L121 137
      L131 129
      L138 120
      L143 111
      L147 96
      L147 81
      L145 76
      L145 72
      L143 69
      L143 65
      L149 54
      L149 52
      L151 50
      L151 47
      L153 43
      L153 34
      Z

      M137 76
      L140 81
      L140 96
      L136 109
      L130 119
      L120 129
      L105 137
      L101 137
      L97 139
      L82 139
      L79 138
      L77 135
      L94 122
      L107 110
      L123 93
      L133 79
      Z
    "
                  />

                  <path
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="
      M103 25
      L100 29
      L100 32
      L98 36
      L87 41
      L86 45
      L90 48
      L93 48
      L97 50
      L102 61
      L106 62
      L109 58
      L109 55
      L111 51
      L122 46
      L123 42
      L119 39
      L116 39
      L112 37
      L107 26
      Z
    "
                  />
                </svg>
              </div>
            </Link>

            <SidebarTrigger
              size="icon-lg"
              className={cn(
                isCollapsed && 'z-10 opacity-0 duration-300 ease-in group-hover:opacity-100',
                isCollapsed ? 'rotate-180' : '',
                'brightness-50 hover:brightness-100',
              )}
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col gap-4 overflow-hidden p-2 pr-0.5 mt-2 space-y-4">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-1 overflow-hidden">
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
                        'flex items-center gap-2.5 rounded-md bg-transparent! p-2.5 text-sm text-foreground/80! transition-colors',
                        'hover:bg-secondary/70!',
                        isActive && 'bg-secondary/80! text-foreground!',
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
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-hide pr-0.5 scroll-smooth ">
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
                  <p className="truncate px-2.5 text-[11px] font-light text-muted-foreground mt-2">
                    No chats found
                  </p>
                ) : (
                  <>
                    {todayChats.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-1.5 px-2.5 text-[10px] font-medium tracking-wider text-muted-foreground/70">
                          Today
                        </p>
                        {todayChats.map(renderChatItem)}
                      </div>
                    )}
                    {earlierChats.length > 0 && (
                      <>
                        <div>
                          <p className="mb-1.5 px-2.5 text-[10px] font-medium tracking-wider text-muted-foreground/70">
                            Earlier
                          </p>
                          {earlierChats.map(renderChatItem)}
                        </div>

                        <Link
                          href={'/history'}
                          className="text-xs uppercase cursor-pointer w-full p-2 text-foreground/80 bg-secondary/30 hover:bg-secondary/50 hover:text-foreground rounded-md"
                        >
                          Show all ...
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-accent p-0">
          <UserNav isCollapsed={isCollapsed} />
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
