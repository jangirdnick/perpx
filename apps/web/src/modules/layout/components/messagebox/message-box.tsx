'use client';

import { memo, useEffect, useRef } from 'react';
import { Message } from '@perpx/shared/types/message.type';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { useGetChatMessages } from '../../../chat/hooks/useChat';

import { HugeiconsIcon } from '@hugeicons/react';
import { AiChat02Icon, Copy01Icon, Pen01Icon } from '@hugeicons/core-free-icons';
import { Button } from '../../../../components/ui/button';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setMessages } from '../../../chat/slices/chatSlice';
import { MessagesSkeleton } from './messages-skeleton';
import MarkdownMessage from './message-markdown';

// ... MessageItem waise ka waisa hi rahega (bas bg-transparent! yaad se check kar lena)
interface MessageItemProps {
  message: Message;
}

const MessageItem = memo(function MessageItem({ message }: MessageItemProps) {
  const isAI = message.role === 'AI';

  return (
    <div
      className={cn(
        'group/message flex w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isAI ? 'justify-start' : 'justify-end',
      )}
    >
      <div
        className={cn('flex w-fit max-w-[92%] gap-3 md:max-w-full ', !isAI && 'flex-row-reverse')}
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              'relative overflow-hidden rounded-md border px-4 py-4 sm:px-5 shadow-sm transition-all',
              'before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-b before:from-white/3 before:to-transparent',
              isAI
                ? 'bg-transparent! before:from-transparent border-none text-card-foreground backdrop-blur'
                : 'border-primary/20 bg-muted',
            )}
          >
            <div
              className={cn(
                'mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.14em]',
              )}
            >
              <span>{isAI ? 'AI Assistant' : 'You'}</span>
              <span className="h-1 w-1 rounded-full bg-current opacity-40" />
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="markdown-body min-w-0 text-[15px] text-foreground">
              <MarkdownMessage content={message.message} isAI={isAI} />
            </div>
          </div>
          {/* Action Buttons */}
          <div
            className={cn(
              'mt-1 flex items-center gap-2 px-2 transition-opacity duration-200',
              'opacity-100 sm:opacity-0 sm:group-hover/message:opacity-100 sm:group-focus-within/message:opacity-100',
              !isAI && 'justify-end',
            )}
          >
            <Button
              type="button"
              variant={'outline'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Copy01Icon} size={16} />
            </Button>
            <Button
              type="button"
              variant={'outline'}
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

  // 🔥 FIX 1: THE DISAPPEARING MESSAGE FIX
  useEffect(() => {
    // Yahan humne isStreaming ko dependency array se hata diya hai.
    // Ab ye sirf tab chalega jab naya data fetch hoga, isliye stream
    // ke khatam hone par ye Redux array ko override/delete nahi karega.
    if (data?.success && chatId && !isStreaming) {
      dispatch(setMessages(data.data.messages as Message[]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chatId, dispatch]);

  // Fixed: Auto-scroll logic
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

  // 🔥 FIX 2: THE SKELETON SCREEN OF DEATH FIX
  // Agar isPending hai, par humare paas Redux me messages aa chuke hain (Optimistic),
  // ya fir streaming chalu hai, toh Skeleton mat dikhao warna message chup jayega.
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
      <div className=" flex w-full flex-col gap-4 py-6">
        {messages.map((message: Message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {/* 🔥 FIX 3: Removed displayedText duplicate state and directly used streamingMessage */}
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
