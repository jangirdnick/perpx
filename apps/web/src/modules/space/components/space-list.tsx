'use client';

import Link from 'next/link';
import { useGetSpaces } from '../hooks/useSpace';
import { Space } from '@perpx/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  AlertCircleIcon,
  Globe02Icon,
  UserGroupIcon,
  LockedIcon,
  User02Icon,
  Folder01Icon,
} from '@hugeicons/core-free-icons';

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

function getVisibilityIcon(type: 'PUBLIC' | 'PRIVATE' | 'GROUP') {
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

export function SpaceList() {
  const { data, isLoading, isError, refetch } = useGetSpaces();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/40 p-4 shadow-2xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
            <div className="mt-6 flex items-center justify-between pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-destructive mb-2" />
        <h3 className="text-sm font-semibold font-sora text-destructive">Failed to load spaces</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {data && !data.success ? data.message : 'Something went wrong while fetching spaces.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const spaces: Space[] = data.data.spaces || [];

  if (spaces.length === 0) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/30 p-8 text-center backdrop-blur-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 mb-4 ring-8 ring-background">
          <span className="text-xl">🌌</span>
        </div>
        <h3 className="text-lg font-sora font-semibold text-foreground/90">No spaces yet</h3>
        <p className="mt-2 text-sm font-sora text-muted-foreground/80 max-w-sm">
          Create a space to organize your chats and start collaborating with others.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {spaces.map((space) => {
        const userMember = space.spaceMembers?.[0];
        const userRole = userMember?.role || 'ADMIN';
        const VisibilityIcon = getVisibilityIcon(space.type);

        return (
          <Link
            key={space.id}
            href={`/spaces/${space.id}`}
            className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card/50 p-4 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-border hover:bg-card/80 hover:shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-foreground/80 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <HugeiconsIcon icon={Folder01Icon} size={14} />
                  </div>
                  <h3 className="font-sora text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {space.title}
                  </h3>
                </div>
                <span className="shrink-0 flex items-center gap-1 rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground uppercase">
                  <HugeiconsIcon icon={VisibilityIcon} size={10} />
                  <span>{space.type}</span>
                </span>
              </div>

              {space.description ? (
                <p className="mt-3 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed font-sora">
                  {space.description}
                </p>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground/40 italic font-sora">
                  No description provided
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground font-sora">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                  <HugeiconsIcon icon={User02Icon} size={10} />
                  <span>{userRole}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground/70 text-[11px]">
                <HugeiconsIcon icon={Clock01Icon} size={12} />
                <span>{formatDate(space.updatedAt)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
