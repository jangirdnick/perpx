'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Image01Icon, SparklesIcon, PlusSignIcon } from '@hugeicons/core-free-icons';

export default function ImagesPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center select-none min-h-[calc(100vh-5rem)]">
      <div className="max-w-md flex flex-col items-center">
        {/* Icon Badge */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
          <HugeiconsIcon icon={Image01Icon} size={32} />
        </div>

        <Badge
          variant="outline"
          className="mb-3 px-3 py-1 text-xs border-primary/30 bg-primary/5 text-primary font-medium flex items-center gap-1.5 rounded-full"
        >
          <HugeiconsIcon icon={SparklesIcon} size={13} />
          Coming Soon
        </Badge>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-sora">
          AI Image Generation
        </h1>

        <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed max-w-sm">
          We are building powerful AI image generation and editing tools. This feature will be
          available in an upcoming update.
        </p>

        <div className="mt-6">
          <Link href="/">
            <Button
              size="default"
              className="rounded-xl px-5 h-9 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span>New Chat</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
