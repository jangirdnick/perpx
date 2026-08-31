import { useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setActiveChatId } from '@/modules/chat/slices/chatSlice';
import { useGetSidebarUserChats } from '@/modules/chat/hooks/useChat';
import type { Chat } from '@perpx/shared/types/chat.type';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarGroup } from '@/components/ui/sidebar';
import ActionButton from '../action-button';

interface NavHistoryProps {
  isMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  activeChatIdFromUrl: string | null;
}

export const NavHistory = memo(function NavHistory({
  isMobile,
  setOpenMobile,
  activeChatIdFromUrl,
}: NavHistoryProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useGetSidebarUserChats();

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

  const renderChatItem = (chat: Chat) => {
    const isActiveChat = activeChatIdFromUrl === chat.id;

    return (
      <div key={chat.id} className="group/chat-item relative rounded-md space-y-0.5">
        <Button
          onClick={() => handleGetChatMessages(chat.id)}
          variant="ghost"
          className={cn(
            'w-full h-fit justify-start py-2 pr-5 text-left cursor-pointer',
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
    <SidebarGroup className="flex-1 min-h-0 p-0">
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-hide pr-0.5 scroll-smooth">
        {error?.message && <p className="px-2.5 text-[11px] text-destructive">{error.message}</p>}

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
  );
});
