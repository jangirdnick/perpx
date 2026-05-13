import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function MessagesSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
          <div className="flex w-full max-w-[88%] gap-3 md:max-w-[80%]">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
