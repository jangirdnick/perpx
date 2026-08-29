import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon } from '@hugeicons/core-free-icons';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background font-sora text-center select-none">
      <div className="max-w-sm flex flex-col items-center">
        <span className="text-7xl font-extrabold tracking-tighter text-muted-foreground/30">
          404
        </span>

        <h1 className="mt-2 text-xl font-bold text-foreground">Page Not Found</h1>

        <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-6">
          <Link href="/">
            <Button
              size="default"
              className="rounded-xl px-5 h-9 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <HugeiconsIcon icon={Home01Icon} size={15} />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
