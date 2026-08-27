'use client';

import { use } from 'react';
import Link from 'next/link';
import { useGetSpaceById } from '../../../../modules/space/hooks/useSpace';
import { getErrorMessage } from '../../../../modules/auth/api/auth.error.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
} from '@hugeicons/core-free-icons';

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
  const { data, isLoading, isError, error } = useGetSpaceById(spaceId);

  // Loading State
  if (isLoading) {
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
  if (isError || !data?.success || !data?.data?.space) {
    const errorMessage =
      getErrorMessage(error) ||
      (data && !data.success ? data.message : 'Space not found or access denied.');

    return (
      <section className="h-full w-full bg-background p-4 max-md:pt-16 md:p-8">
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

  const space = data.data.space;
  const VisibilityIcon = getVisibilityIcon(space.type);
  const userMember = space.spaceMembers?.[0];
  const userRole = userMember?.role || 'ADMIN';

  return (
    <section className="h-full w-full p-4 max-md:pt-16 ">
      <div className="w-full flex flex-col gap-2 h-full">
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

          <Link
            href="/spaces"
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs font-sora text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
            <span>Back</span>
          </Link>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 h-full">
          {/* LEFT COLUMN: Space Header & Chats */}
          <div className="flex flex-col gap-4 lg:col-span-8 max-h-full">
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
            <div className="h-full flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-4 shadow-2xs backdrop-blur-xs font-sora flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={MessageMultiple01Icon} size={18} className="text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Conversations</h2>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  <span>New Chat</span>
                </Link>
              </div>

              {/* Conversations List / Placeholder */}
              <div className="flex min-h-55 h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 p-6 text-center my-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 mb-3">
                  <HugeiconsIcon
                    icon={MessageMultiple01Icon}
                    size={20}
                    className="text-muted-foreground"
                  />
                </div>
                <h3 className="text-sm font-semibold text-foreground/90">No chats in this space</h3>
                <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">
                  Start a new conversation in {space.title} to collaborate with your team.
                </p>
              </div>
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
                    {space._count?.spaceMembers ?? space.spaceMembers?.length ?? 1}
                  </p>
                </div>

                <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <HugeiconsIcon icon={MessageMultiple01Icon} size={12} />
                    <span>Chats</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {space._count?.chats ?? 0}
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
                  {space.spaceMembers.map((member) => (
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
      </div>
    </section>
  );
}
