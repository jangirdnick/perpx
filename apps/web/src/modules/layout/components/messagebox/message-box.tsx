'use client';

import { memo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Message } from '@perpx/shared/types/message.type';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { useGetChatMessages } from '../../../chat/hooks/useChat';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  Copy01Icon,
  Globe02Icon,
  Pen01Icon,
  File01Icon,
  Image01Icon,
  Pdf01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '../../../../components/ui/button';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setMessages } from '../../../chat/slices/chatSlice';
import { MessagesSkeleton } from './messages-skeleton';
import MarkdownMessage from './message-markdown';
import Link from 'next/link';
import { toast } from 'sonner';

interface MessageItemProps {
  message: Message;
}

function isImageType(type?: string) {
  return typeof type === 'string' && type.startsWith('image/');
}

function isPdfType(type?: string) {
  return typeof type === 'string' && type === 'application/pdf';
}

const MessageItem = memo(function MessageItem({ message }: MessageItemProps) {
  const isAI = message.role === 'AI';
  const isHuman = message.role === 'HUMAN';
  const hasSources = Array.isArray(message.sources) && message.sources.length > 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copy successful');
  };

  return (
    <div
      className={cn(
        'group/message flex w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isAI ? 'justify-start' : 'justify-end',
      )}
    >
      <div
        className={cn(
          'flex w-fit max-w-full md:max-w-[92%] gap-3 md:max-w-full',
          !isAI && 'flex-row-reverse',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              'relative overflow-hidden rounded-md border px-4 py-4  transition-all sm:px-5',
              'before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-b before:from-white/3 before:to-transparent',
              isAI
                ? 'border-none bg-transparent! text-card-foreground backdrop-blur before:from-transparent'
                : 'border-primary/20 bg-muted shadow-sm',
            )}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span>{isAI ? 'AI Assistant' : 'You'}</span>
              <span className="h-1 w-1 rounded-full bg-current opacity-40" />
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {hasSources && (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <HugeiconsIcon icon={isHuman ? File01Icon : Globe02Icon} size={14} />
                  <span>{isHuman ? 'Attachments' : 'Sources'}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {message.sources?.map((source, idx) => {
                    const type = source.snippet;
                    const isImage = isImageType(type);
                    const isPdf = isPdfType(type);
                    const hasUrl = typeof source.url === 'string' && source.url.length > 0;

                    if (isHuman && isImage && hasUrl) {
                      return (
                        <Link
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex w-45 overflow-hidden rounded-md border border-border bg-background transition-colors hover:bg-muted/40"
                          title={`${source.title} • ${type}`}
                        >
                          <div className="relative h-28 w-full">
                            <Image
                              src={source.url}
                              alt={source.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 flex min-w-0 bg-background/40">
                            <span className="truncate text-[10px] font-light text-foreground">
                              {source.title}
                            </span>
                          </div>
                        </Link>
                      );
                    }

                    if (isHuman && isPdf && hasUrl) {
                      return (
                        <Link
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex max-w-55 items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/40"
                          title={`${source.title} • ${type}`}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-500">
                            <HugeiconsIcon icon={Pdf01Icon} size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {source.title}
                            </div>
                            <div className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                              PDF
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    return hasUrl ? (
                      <Link
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex max-w-55 items-start gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/80"
                        title={type || source.title}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted-foreground/10 text-muted-foreground">
                          <HugeiconsIcon icon={isHuman ? File01Icon : Globe02Icon} size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">
                            {source.title}
                          </span>
                          {type && (
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {type}
                            </span>
                          )}
                        </span>
                      </Link>
                    ) : (
                      <div
                        key={idx}
                        className="flex max-w-55 items-start gap-2 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs"
                        title={type || source.title}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted-foreground/10 text-muted-foreground">
                          <HugeiconsIcon icon={File01Icon} size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">
                            {source.title}
                          </span>
                          {type && (
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {type}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="markdown-body min-w-0 text-[15px] text-foreground">
              <MarkdownMessage content={message.message} isAI={isAI} />
            </div>
          </div>

          <div
            className={cn(
              'mt-1 flex items-center gap-2 px-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover/message:opacity-100 sm:group-focus-within/message:opacity-100',
              !isAI && 'justify-end',
            )}
          >
            <Button
              type="button"
              onClick={() => handleCopy(message.message)}
              variant="outline"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Copy01Icon} size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Pen01Icon} size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function MessageBox({ chatId }: { chatId: string }) {
  const dispatch = useAppDispatch();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const { data, isPending, error } = useGetChatMessages(chatId);
  const { messages, streamingMessage, isStreaming } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (data?.success && chatId && !isStreaming) {
      dispatch(setMessages(data.data.messages as Message[]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chatId, dispatch]);

  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) return;

    const viewport = root.querySelector(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLDivElement | null;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: isStreaming ? 'auto' : 'smooth',
    });
  }, [streamingMessage, messages.length, isStreaming]);

  if (isPending && messages.length === 0 && !isStreaming) {
    return <MessagesSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Failed to load messages: {error.message}
        </div>
      </div>
    );
  }

  if (!data?.success && messages.length === 0 && !isStreaming) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-md border bg-muted">
          <HugeiconsIcon icon={AiChat02Icon} size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Start a new conversation</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your messages will appear here once the chat starts.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full w-full">
      <div className="flex w-full flex-col gap-4 py-6 max-md:pt-12">
        {messages.map((message: Message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {isStreaming && streamingMessage && (
          <MessageItem
            message={{
              id: 'streaming',
              role: 'AI',
              message: streamingMessage + '▋',
              userId: 'streaming-user',
              chatId: 'streaming-chat',
              createdAt: new Date().toISOString(),
            }}
          />
        )}
      </div>
    </ScrollArea>
  );
}
