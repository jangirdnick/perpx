'use client';

import { use, useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSpaceActiveChatId,
  removeSpaceActiveChatId,
  resetSpaceChatState,
} from '../../../../modules/chat/slices/spaceChatSlice';
import { useGetSpaceById, useDeleteSpace } from '../../../../modules/space/hooks/useSpace';
import {
  useSpaceChatHistory,
  useUpdateSpaceChat,
  useDeleteSpaceChat,
} from '../../../../modules/chat/hooks/useSpaceChat';
import { useSpaceComposer } from '../../../../modules/layout/hooks/useSpaceComposer';
import { getErrorMessage } from '../../../../modules/auth/api/auth.error.api';
import MessageBox from '@/modules/layout/components/messagebox/message-box';
import ChatComposer from '../../../../modules/layout/components/home/chat-composer';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft02Icon,
  Globe02Icon,
  UserGroupIcon,
  LockedIcon,
  User02Icon,
  Clock01Icon,
  AlertCircleIcon,
  MessageMultiple01Icon,
  Folder01Icon,
  Calendar01Icon,
  PlusSignIcon,
  Delete02Icon,
  Loading03Icon,
  MoreVerticalIcon,
  Edit02Icon,
} from '@hugeicons/core-free-icons';
import { Chat, SpaceMember } from '@perpx/shared';

interface SpaceDetailsPageProps {
  params: Promise<{
    spaceId: string;
  }>;
}

function formatDate(dateString?: string) {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function getVisibilityIcon(type?: 'PUBLIC' | 'PRIVATE' | 'GROUP') {
  switch (type) {
    case 'PUBLIC':
      return Globe02Icon;
    case 'GROUP':
      return UserGroupIcon;
    case 'PRIVATE':
    default:
      return LockedIcon;
  }
}

export default function SpaceDetailsPage({ params }: SpaceDetailsPageProps) {
  const { spaceId } = use(params);
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, error } = useGetSpaceById(spaceId);
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

  const { mutate: deleteSpaceMutate, isPending: isDeleting } = useDeleteSpace();
  const { activeChatId, chats: spaceChatsFromSlice } = useAppSelector((state) => state.spaceChat);
  const composer = useSpaceComposer(spaceId);

  const { mutate: updateSpaceChatMutate, isPending: isUpdatingChat } = useUpdateSpaceChat(spaceId);
  const { mutate: deleteSpaceChatMutate, isPending: isDeletingChat } = useDeleteSpaceChat(spaceId);

  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingChat, setDeletingChat] = useState<Chat | null>(null);

  const allFetchedChats = useMemo(() => {
    if (!chatsData?.pages) return [];
    const list: Chat[] = [];
    chatsData.pages.forEach((page) => {
      if (page.success && page.data?.chats) {
        list.push(...page.data.chats);
      }
    });
    return list;
  }, [chatsData]);

  const spaceChats = spaceChatsFromSlice.length > 0 ? spaceChatsFromSlice : allFetchedChats;

  const isChatView = searchParams.get('chatId') || searchParams.get('newChat') === 'true';

  useEffect(() => {
    return () => {
      dispatch(resetSpaceChatState());
    };
  }, [spaceId, dispatch]);

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    const isNewChat = searchParams.get('newChat') === 'true';

    if (chatId) {
      dispatch(setSpaceActiveChatId(chatId));
    } else if (isNewChat) {
      dispatch(removeSpaceActiveChatId());
    }
  }, [searchParams, dispatch]);

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

  // Loading State
  if (isLoading && !isChatView) {
    return (
      <section className="h-full w-full bg-background p-4 max-md:pt-16 md:p-8">
        <div className="w-full flex flex-col gap-6">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 text-xs">
            <Skeleton className="h-4 w-16 rounded-md" />
            <span className="text-muted-foreground/40">/</span>
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error / Not Found State
  if ((isError || !data?.success || !data?.data?.space) && !isChatView) {
    const errorMessage =
      getErrorMessage(error) ||
      (data && !data.success ? data.message : 'Space not found or access denied.');

    return (
      <section className="h-full w-full bg-background p-4 max-md:pt-16 md:p-8 ">
        <div className="w-full flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 font-sora">
            <Link href="/spaces">
              <Badge
                variant="outline"
                className="hover:bg-secondary transition-colors cursor-pointer text-xs font-normal"
              >
                Spaces
              </Badge>
            </Link>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <Badge variant="destructive" className="text-xs font-medium">
              Error
            </Badge>
          </div>

          <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center backdrop-blur-xs">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-10 w-10 text-destructive mb-3" />
            <h3 className="text-base font-sora font-semibold text-destructive">
              Unable to load Space
            </h3>
            <p className="mt-1.5 text-xs font-sora text-muted-foreground max-w-sm">
              {errorMessage}
            </p>
            <Link
              href="/spaces"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-sora font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
              Back to Spaces
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const space = data && 'data' in data ? data.data.space : undefined;
  const VisibilityIcon = getVisibilityIcon(space?.type);
  const userMember = space?.spaceMembers?.[0];
  const userRole = userMember?.role || 'ADMIN';

  if (isChatView) {
    return (
      <section className="max-h-screen h-full w-full bg-background flex flex-col">
        <div className="flex items-center gap-2 font-sora p-4 md:px-8 border-b border-border/40 shrink-0">
          <Link href={`/spaces/${spaceId}`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
              <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
              <span>Back to {space?.title || 'Space'}</span>
            </Button>
          </Link>
        </div>
        <div
          className={cn(
            'mx-auto flex w-full max-w-3xl min-w-0 flex-col px-4 md:px-0 flex-1 overflow-hidden relative',
            activeChatId ? 'gap-0 py-2 pb-4' : 'items-center justify-center py-10',
          )}
        >
          {activeChatId ? (
            <>
              <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto">
                <MessageBox chatId={activeChatId} isSpaceChat={true} />
              </div>
              <div className="sticky bottom-0 z-20 shrink-0 bg-background pt-2 pb-2">
                <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-linear-to-t from-background via-background/80 to-transparent" />
                <ChatComposer {...composer} />
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 flex flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                  <HugeiconsIcon icon={MessageMultiple01Icon} size={24} />
                </div>
                <h2 className="text-xl font-bold font-sora">New Conversation</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask anything related to {space?.title || 'this space'}.
                </p>
              </div>
              <div className="w-full shrink-0">
                <ChatComposer {...composer} isHero={true} />
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/50 shrink-0">
                <span>Shift + Enter for new line</span>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  if (!space) return null;

  return (
    <section className="h-full w-full p-4 max-md:pt-16 flex flex-col min-h-0 max-md:overflow-y-auto">
      <div className="w-full flex flex-col gap-2 flex-1 min-h-0">
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-sora">
            <Link href="/spaces">
              <Badge
                variant="outline"
                className="hover:bg-secondary transition-colors cursor-pointer text-xs font-normal"
              >
                Spaces
              </Badge>
            </Link>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <Badge variant="secondary" className="text-xs font-medium max-w-55 truncate">
              {space.title}
            </Badge>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-lg font-sora text-xs px-2 py-1.5 h-auto cursor-pointer"
              >
                {isDeleting ? (
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                )}
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md rounded-2xl border-border bg-card/95 backdrop-blur-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-sora text-lg">Delete space</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  Are you sure you want to delete this space? This action cannot be undone and will
                  permanently remove all related space data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex items-center justify-between w-full pt-4 sm:justify-between font-sora">
                <AlertDialogCancel className="font-sora px-2 py-4 rounded-lg text-xs cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => deleteSpaceMutate(spaceId)}
                  className="font-sora px-2 py-4 rounded-lg text-xs cursor-pointer"
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Space'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 h-full flex-1 md:min-h-0 max-md:h-250">
          {/* LEFT COLUMN: Space Header & Chats */}
          <div className="flex flex-col gap-4 lg:col-span-8 min-h-0">
            {/* Space Name & Header */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={Folder01Icon} size={24} />
                </div>
                <div>
                  <h1 className="font-sora text-xl font-bold tracking-tight text-foreground md:text-2xl">
                    {space.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] uppercase gap-1 px-2.5 py-0.5"
                    >
                      <HugeiconsIcon icon={VisibilityIcon} size={11} />
                      <span>{space.type}</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className="font-sora text-[10px] uppercase gap-1 bg-primary/10 text-primary border-primary/20 px-2 py-0.5"
                    >
                      <HugeiconsIcon icon={User02Icon} size={11} />
                      <span>{userRole}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {space.description ? (
                <p className="mt-1 font-sora text-sm leading-relaxed text-muted-foreground/90">
                  {space.description}
                </p>
              ) : (
                <p className="mt-1 font-sora text-xs italic text-muted-foreground/50">
                  No description provided for this space.
                </p>
              )}
            </div>

            {/* Bottom: Space Chats / Conversations */}
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

              {/* Conversations List / Placeholder */}
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
                  <h3 className="text-sm font-semibold text-foreground/90">
                    No chats in this space
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">
                    Start a new conversation in {space?.title || 'this space'} to collaborate with
                    your team.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Space Info & Members */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            {/* Space Info & Stats Card */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-2xs backdrop-blur-xs font-sora">
              <h2 className="text-sm font-semibold text-foreground">Space Overview</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <HugeiconsIcon icon={UserGroupIcon} size={12} />
                    <span>Members</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {space?._count?.spaceMembers ?? space?.spaceMembers?.length ?? 1}
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <HugeiconsIcon icon={MessageMultiple01Icon} size={12} />
                    <span>Chats</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {space?._count?.chats ?? 0}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs border-t border-border/40">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={VisibilityIcon} size={13} />
                    Visibility
                  </span>
                  <span className="font-mono font-medium text-foreground uppercase">
                    {space.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} size={13} />
                    Last Updated
                  </span>
                  <span className="font-medium text-foreground">{formatDate(space.updatedAt)}</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Calendar01Icon} size={13} />
                    Created Date
                  </span>
                  <span className="font-medium text-foreground">{formatDate(space.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Space Members Card */}
            {space.spaceMembers && space.spaceMembers.length > 0 && (
              <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-2xs backdrop-blur-xs font-sora">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">
                    Members ({space.spaceMembers.length})
                  </h2>
                </div>

                <div className="divide-y divide-border/40">
                  {space.spaceMembers.map((member: SpaceMember) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                          {member.user?.fullname
                            ? member.user.fullname.charAt(0).toUpperCase()
                            : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate max-w-35">
                            {member.user?.fullname || 'User'}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 truncate max-w-35">
                            {member.user?.email || ''}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 font-mono text-[9px] uppercase px-2 py-0.5"
                      >
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-4 w-full flex items-center justify-center  shrink-0 md:hidden" />
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
    </section>
  );
}
