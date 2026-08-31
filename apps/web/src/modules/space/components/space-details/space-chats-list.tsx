import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MessageMultiple01Icon,
  PlusSignIcon,
  AlertCircleIcon,
  MoreVerticalIcon,
  Edit02Icon,
  Delete02Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';

import {
  useSpaceChatHistory,
  useUpdateSpaceChat,
  useDeleteSpaceChat,
} from '../../../chat/hooks/useSpaceChat';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Chat } from '@perpx/shared';

function formatDate(dateString?: string | Date) {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return String(dateString);
  }
}

interface SpaceChatsListProps {
  spaceId: string;
  spaceTitle: string;
}

export function SpaceChatsList({ spaceId, spaceTitle }: SpaceChatsListProps) {
  const DEFAULT_LIMIT = 15;
  const MIN_LIMIT = 10;
  const ROW_HEIGHT = 64;
  const RESERVED_HEIGHT = 300;

  const [limit, setLimit] = useState(DEFAULT_LIMIT);
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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    data: chatsData,
    isLoading: chatsLoading,
    isError: chatsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSpaceChatHistory(spaceId, limit);

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

  const { mutate: updateSpaceChatMutate, isPending: isUpdatingChat } = useUpdateSpaceChat(spaceId);
  const { mutate: deleteSpaceChatMutate, isPending: isDeletingChat } = useDeleteSpaceChat(spaceId);

  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingChat, setDeletingChat] = useState<Chat | null>(null);

  const { chats: spaceChatsFromSlice } = useAppSelector((state) => state.spaceChat);

  const allFetchedChats = useMemo(() => {
    if (!chatsData?.pages) return [];
    const list: Chat[] = [];
    chatsData.pages.forEach((page: { success?: boolean; data?: { chats?: Chat[] } }) => {
      if (page.success && page.data?.chats) {
        list.push(...page.data.chats);
      }
    });
    return list;
  }, [chatsData]);

  const spaceChats = spaceChatsFromSlice.length > 0 ? spaceChatsFromSlice : allFetchedChats;

  const handleUpdateChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChat || !editTitle.trim()) return;
    updateSpaceChatMutate(
      { chatId: editingChat.id, title: editTitle.trim() },
      {
        onSuccess: () => {
          setEditingChat(null);
          setEditTitle('');
        },
      },
    );
  };

  const handleDeleteChatConfirm = () => {
    if (!deletingChat) return;
    deleteSpaceChatMutate(deletingChat.id, {
      onSuccess: () => {
        setDeletingChat(null);
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-2xs backdrop-blur-xs font-sora flex-1 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={MessageMultiple01Icon} size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Conversations</h2>
          </div>
          <Link
            href={`/spaces/${spaceId}?newChat=true`}
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            <span>New Chat</span>
          </Link>
        </div>

        {chatsLoading ? (
          <div className="flex flex-col gap-2 mt-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : chatsError || (chatsData?.pages && !chatsData.pages[0]?.success) ? (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6 text-destructive mb-2" />
            <h3 className="text-sm font-semibold font-sora text-destructive">
              Failed to load chats
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {chatsData?.pages?.[0] && !chatsData.pages[0].success
                ? chatsData.pages[0].message
                : 'Something went wrong.'}
            </p>
          </div>
        ) : spaceChats.length > 0 ? (
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide mt-2 flex-1 min-h-0">
            {spaceChats.map((chat: Chat) => (
              <div
                key={chat.id}
                className="group flex items-center justify-between rounded-xl border border-border/40 bg-background/50 p-3 hover:bg-secondary/50 transition-colors"
              >
                <Link
                  href={`/spaces/${spaceId}?chatId=${chat.id}`}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={MessageMultiple01Icon} size={16} />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-sm font-medium text-foreground truncate">
                      {chat.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {formatDate(chat.createdAt)}
                    </span>
                  </div>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg shrink-0"
                    >
                      <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 font-sora">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingChat(chat);
                        setEditTitle(chat.title);
                      }}
                      className="cursor-pointer gap-2 text-xs"
                    >
                      <HugeiconsIcon icon={Edit02Icon} size={14} />
                      <span>Edit Title</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setDeletingChat(chat);
                      }}
                      className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                      <span>Delete Chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <div
              ref={observerTarget}
              className="h-8 w-full flex items-center justify-center mt-2 shrink-0 "
            >
              {isFetchingNextPage && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-55 h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 p-6 text-center my-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 mb-3">
              <HugeiconsIcon
                icon={MessageMultiple01Icon}
                size={20}
                className="text-muted-foreground"
              />
            </div>
            <h3 className="text-sm font-semibold text-foreground/90">No chats in this space</h3>
            <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">
              Start a new conversation in {spaceTitle} to collaborate with your team.
            </p>
          </div>
        )}
      </div>

      {/* Edit Chat Title Dialog */}
      <Dialog open={!!editingChat} onOpenChange={(open) => !open && setEditingChat(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl font-sora">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Chat Title</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the title of this space conversation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateChatSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="chat-title" className="text-xs font-medium">
                Title
              </Label>
              <Input
                id="chat-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter chat title..."
                className="text-xs rounded-xl"
                autoFocus
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingChat(null)}
                className="text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingChat || !editTitle.trim()}
                className="text-xs rounded-lg gap-2 cursor-pointer"
              >
                {isUpdatingChat ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation AlertDialog */}
      <AlertDialog open={!!deletingChat} onOpenChange={(open) => !open && setDeletingChat(null)}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl font-sora">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete &quot;{deletingChat?.title}&quot;? This will
              permanently delete all messages inside this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-between w-full pt-4">
            <AlertDialogCancel className="text-xs rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteChatConfirm}
              disabled={isDeletingChat}
              className="text-xs rounded-lg cursor-pointer"
            >
              {isDeletingChat ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete Conversation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
