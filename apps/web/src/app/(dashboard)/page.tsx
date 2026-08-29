'use client';

import MessageBox from '@/modules/layout/components/messagebox/message-box';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { HomeHero } from '@/modules/layout/components/home/home-hero';
import { ChatComposer } from '../../modules/layout/components/home/chat-composer';
import { useHomeComposer } from '../../modules/layout/hooks/useHomeComposer';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { setActiveChatId, removeActiveChatId } from '../../modules/chat/slices/chatSlice';

export default function Home() {
  const { activeChatId } = useAppSelector((state) => state.chat);
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const composer = useHomeComposer();

  useEffect(() => {
    const chatId = searchParams.get('chatId');

    if (chatId) {
      dispatch(setActiveChatId(chatId));
    } else {
      dispatch(removeActiveChatId());
    }
  }, [searchParams, dispatch]);

  return (
    <section className="max-h-screen h-full w-full">
      <div
        className={cn(
          'mx-auto flex w-full max-w-3xl min-w-0 h-full flex-col px-4 md:px-0',
          activeChatId ? 'gap-0 py-2 pb-4' : 'items-center justify-center py-10',
        )}
      >
        {activeChatId ? (
          <>
            <div className="min-h-0 min-w-0 w-full flex-1">
              <MessageBox chatId={activeChatId} />
            </div>

            <div className="sticky bottom-0 z-20 ">
              <div className="pointer-events-none absolute inset-x-0 top-2 h-10 bg-linear-to-t from-background via-white/10 to-transparent rounded-full" />
              <ChatComposer {...composer} />
            </div>
          </>
        ) : (
          <>
            <HomeHero />
            <div className="w-full">
              <ChatComposer {...composer} isHero={true} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/50">
              <span>Shift + Enter for new line</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
