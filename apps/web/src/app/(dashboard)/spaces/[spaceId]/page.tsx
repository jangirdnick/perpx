'use client';

import { use, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSpaceActiveChatId,
  removeSpaceActiveChatId,
  resetSpaceChatState,
} from '../../../../modules/chat/slices/spaceChatSlice';
import { useGetSpaceById } from '../../../../modules/space/hooks/useSpace';
import { useSpaceComposer } from '../../../../modules/layout/hooks/useSpaceComposer';
import { getErrorMessage } from '../../../../modules/auth/api/auth.error.api';

import MessageBox from '@/modules/layout/components/messagebox/message-box';
import ChatComposer from '../../../../modules/layout/components/home/chat-composer';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft02Icon,
  AlertCircleIcon,
  MessageMultiple01Icon,
} from '@hugeicons/core-free-icons';

import { SpaceHeader } from '../../../../modules/space/components/space-details/space-header';
import { SpaceOverview } from '../../../../modules/space/components/space-details/space-overview';
import { SpaceMembersList } from '../../../../modules/space/components/space-details/space-members-list';
import { SpaceChatsList } from '../../../../modules/space/components/space-details/space-chats-list';
import { DeleteSpaceAlert } from '../../../../modules/space/components/space-details/delete-space-alert';

interface SpaceDetailsPageProps {
  params: Promise<{
    spaceId: string;
  }>;
}

export default function SpaceDetailsPage({ params }: SpaceDetailsPageProps) {
  const { spaceId } = use(params);
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, error } = useGetSpaceById(spaceId);
  const { activeChatId } = useAppSelector((state) => state.spaceChat);
  const composer = useSpaceComposer(spaceId);

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
  const userMember = space?.spaceMembers?.[0];
  const userRole = userMember?.role || 'ADMIN';

  if (isChatView) {
    return (
      <section className="max-h-screen h-full w-full bg-background flex flex-col">
        <div className="flex items-center gap-2 font-sora p-4 md:px-8 border-b border-border/40 shrink-0">
          <Link href={`/spaces/${spaceId}`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 cursor-pointer">
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

          <DeleteSpaceAlert spaceId={spaceId} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 h-full flex-1 md:min-h-0 max-md:h-250">
          <div className="flex flex-col gap-4 lg:col-span-8 min-h-0">
            <SpaceHeader space={space} userRole={userRole} />
            <SpaceChatsList spaceId={spaceId} spaceTitle={space.title} />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <SpaceOverview space={space} />
            <SpaceMembersList spaceMembers={space.spaceMembers} />
          </div>
        </div>

        <div className="h-4 w-full flex items-center justify-center shrink-0 md:hidden" />
      </div>
    </section>
  );
}
