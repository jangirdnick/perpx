'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Message } from '@perpx/shared/types/message.type';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { useGetChatMessages } from '../../../chat/hooks/useChat';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  AiBookIcon,
  Copy01Icon,
  Tick02Icon,
  Globe02Icon,
  File01Icon,
  Pdf01Icon,
  Pen01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
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

  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'group/message flex w-full min-w-0 max-w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isAI ? 'justify-start' : 'justify-end',
      )}
    >
      <div
        className={cn(
          'flex w-full min-w-0 max-w-full gap-3',
          !isAI && 'flex-row-reverse max-w-[90%] sm:max-w-[85%] w-fit',
        )}
      >
        <div
          className={`flex min-w-0 flex-1 flex-col w-full max-w-full ${!isAI && 'items-end'} group/youser`}
        >
          {/* Main Message Bubble */}
          <div
            className={cn(
              'relative min-w-0 w-fit max-w-full transition-all',
              isAI
                ? 'bg-transparent text-card-foreground py-1'
                : 'rounded-2xl border border-primary/20 bg-muted/80 px-4 py-3.5 shadow-2xs',
            )}
          >
            {/* Header meta */}
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground/80">
              <div className="flex items-center gap-2 font-medium">
                {isAI ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <HugeiconsIcon icon={AiBookIcon} size={15} className="text-primary" />
                    <span>AI Assistant</span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">You</span>
                )}
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="text-[11px] font-normal text-muted-foreground/70">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Sources & Attachments section */}
            {hasSources && (
              <div className="my-3">
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
                          className="group relative flex w-44 overflow-hidden rounded-xl border border-border/80 bg-background/80 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                          title={`${source.title} • ${type}`}
                        >
                          <div className="relative h-28 w-full">
                            <Image
                              src={source.url}
                              alt={source.title}
                              fill
                              unoptimized
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 flex min-w-0 bg-background/85 px-2 py-1 backdrop-blur-xs">
                            <span className="truncate text-[10px] font-medium text-foreground">
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
                          className="flex max-w-56 items-start gap-2.5 rounded-xl border border-border/80 bg-background/80 px-3 py-2.5 text-xs shadow-xs transition-all hover:border-primary/40 hover:bg-muted/50"
                          title={`${source.title} • ${type}`}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                            <HugeiconsIcon icon={Pdf01Icon} size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {source.title}
                            </div>
                            <div className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              PDF Document
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
                        className="flex max-w-60 items-center gap-2 rounded-xl border border-border/70 bg-zinc-900/50 px-3 py-2 text-xs transition-all hover:border-border hover:bg-zinc-800/80"
                        title={type || source.title}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted-foreground/10 text-muted-foreground">
                          <HugeiconsIcon icon={isHuman ? File01Icon : Globe02Icon} size={13} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">
                          {source.title}
                        </span>
                      </Link>
                    ) : (
                      <div
                        key={idx}
                        className="flex max-w-60 items-center gap-2 rounded-xl border border-border/70 bg-zinc-900/50 px-3 py-2 text-xs"
                        title={type || source.title}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted-foreground/10 text-muted-foreground">
                          <HugeiconsIcon icon={File01Icon} size={13} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">
                          {source.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Render Markdown Message */}
            <div className="markdown-body min-w-0 w-full max-w-full text-[15px] text-foreground">
              <MarkdownMessage content={message.message} isAI={isAI} />
            </div>
          </div>

          {/* Action Toolbar for AI & User Messages */}
          <div
            className={cn(
              'mt-1.5 flex items-center gap-1 text-muted-foreground transition-opacity duration-200',
              isAI
                ? 'opacity-100'
                : 'justify-end opacity-100 sm:opacity-0 sm:group-hover/youser:opacity-100',
            )}
          >
            {!isAI && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                title="Edit message"
              >
                <HugeiconsIcon icon={Pen01Icon} size={14} />
                <span className="text-[11px]">Edit</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={() => handleCopy(message.message)}
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              title="Copy message"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                size={14}
                className={copied ? 'text-emerald-400' : ''}
              />
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </Button>

            {isAI && (
              <>
                <Button
                  type="button"
                  onClick={() => setLiked(liked === true ? null : true)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer',
                    liked === true && 'text-green-400 bg-green-400/10',
                  )}
                  title="Good response"
                >
                  <HugeiconsIcon icon={ThumbsUpIcon} size={14} />
                </Button>

                <Button
                  type="button"
                  onClick={() => setLiked(liked === false ? null : false)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer',
                    liked === false && 'text-destructive bg-destructive/10',
                  )}
                  title="Bad response"
                >
                  <HugeiconsIcon icon={ThumbsDownIcon} size={14} />
                </Button>
              </>
            )}
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
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive shadow-xs">
          Failed to load messages: {error.message}
        </div>
      </div>
    );
  }

  if (!data?.success && messages.length === 0 && !isStreaming) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border/80 bg-muted/50 shadow-xs">
          <HugeiconsIcon icon={AiChat02Icon} size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Start a new conversation</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your messages will appear here once the chat starts.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full w-full min-w-0 max-w-full message-scrollbar">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-6 py-6 max-md:pt-12">
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
