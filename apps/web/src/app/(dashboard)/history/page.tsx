'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useChatHistory } from '../../../modules/chat/hooks/useChat';
import { Skeleton } from '../../../components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Chat } from '@perpx/shared/types/chat.type';
import { useAppDispatch } from '../../../store/hooks';
import { setActiveChatId, removeActiveChatId } from '../../../modules/chat/slices/chatSlice';
import ActionButton from '../../../modules/layout/components/navbar/action-button';
import {
  Message02Icon,
  Search01Icon,
  PlusSignCircleIcon,
  Sorting01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 10;
const ROW_HEIGHT = 56;
const RESERVED_HEIGHT = 180;

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}

export default function HistoryPage() {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const router = useRouter();
  const dispatch = useAppDispatch();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - RESERVED_HEIGHT;

      const calculatedLimit = Math.max(MIN_LIMIT, Math.ceil(availableHeight / ROW_HEIGHT));

      setLimit((currentLimit) =>
        currentLimit === calculatedLimit ? currentLimit : calculatedLimit,
      );
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChatHistory(limit);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleOpenChat = (chatId: string) => {
    dispatch(setActiveChatId(chatId));
    router.push(`/?chatId=${chatId}`);
  };

  const handleNewChat = () => {
    dispatch(removeActiveChatId());
    router.push('/');
  };

  // Flatten all chats from pages
  const allChats = useMemo(() => {
    if (!data?.pages) return [];
    const list: Chat[] = [];
    data.pages.forEach((page) => {
      if (page.success && page.data?.chats) {
        list.push(...page.data.chats);
      }
    });
    return list;
  }, [data]);

  // Filter & Sort chats
  const filteredChats = useMemo(() => {
    let result = [...allChats];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((chat) => chat.title?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
    return result;
  }, [allChats, searchQuery, sortOrder]);

  const firstPage = data?.pages?.[0];
  const noChatsFound = firstPage?.success && allChats.length === 0;

  return (
    <section className="h-full w-full p-4 max-md:pt-16 mx-auto flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-xl md:text-2xl font-inter tracking-tight font-semibold">History</h1>
          <p className="mt-0.5 text-xs text-muted-foreground max-md:hidden">
            View and manage all your past conversations.
          </p>
        </div>

        <Button className="flex items-center gap-1 rounded-lg px-2 py-4" onClick={handleNewChat}>
          <HugeiconsIcon
            className="w-3! h-3!"
            icon={PlusSignCircleIcon}
            size={16}
            strokeWidth={2}
          />
          <span className="font-sora text-xs">New Chat</span>
        </Button>
      </div>

      {/* Sub-header / Filter Controls */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-full">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="pl-9 h-9 text-xs rounded-xl bg-secondary/30 border-border/50 focus:bg-background"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs gap-2 rounded-xl border-border/50 bg-secondary/30 hover:bg-secondary/60 cursor-pointer"
            >
              <HugeiconsIcon icon={Sorting01Icon} size={14} />
              <span className="capitalize">Sort: {sortOrder}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-9999 text-xs font-sora">
            <DropdownMenuItem onClick={() => setSortOrder('newest')} className="cursor-pointer">
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('oldest')} className="cursor-pointer">
              Oldest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-1 pb-20">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: Math.max(limit, 6) }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl bg-muted/40" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-destructive text-xs font-medium">
            Failed to load chat history. Please try again later.
          </div>
        )}

        {!isLoading && !isError && noChatsFound && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <HugeiconsIcon icon={Message02Icon} size={40} className="mb-3 opacity-40" />
            <p className="text-xs font-inter">No history found. Start a new chat!</p>
          </div>
        )}

        {!isLoading && !isError && !noChatsFound && filteredChats.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-xs font-inter">
            No chats match &quot;{searchQuery}&quot;
          </div>
        )}

        {filteredChats.map((chat: Chat) => (
          <div
            key={chat.id}
            className="group relative flex items-center justify-between px-3.5 py-3 rounded-xl border border-transparent hover:border-sidebar-border hover:bg-secondary/40 transition-all duration-150 cursor-pointer"
            onClick={() => handleOpenChat(chat.id)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                className="shrink-0 text-muted-foreground/70 group-hover:text-foreground transition-colors"
              />
              <span className="text-xs md:text-sm font-inter text-foreground/90 group-hover:text-foreground truncate">
                {chat.title || 'Untitled Chat'}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-inter text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                {formatRelativeTime(chat.updatedAt)}
              </span>

              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ActionButton chat={chat} />
              </div>
            </div>
          </div>
        ))}

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="h-8 w-full flex items-center justify-center mt-2">
          {isFetchingNextPage && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>
    </section>
  );
}
