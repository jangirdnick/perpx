import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserGroupIcon,
  MessageMultiple01Icon,
  Globe02Icon,
  LockedIcon,
  Clock01Icon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons';

function formatDate(dateString?: string | Date) {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return String(dateString);
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

interface SpaceOverviewProps {
  space: {
    type: 'PUBLIC' | 'PRIVATE' | 'GROUP';
    updatedAt: string | Date;
    createdAt: string | Date;
    spaceMembers?: unknown[];
    _count?: {
      spaceMembers?: number;
      chats?: number;
    };
  };
}

export function SpaceOverview({ space }: SpaceOverviewProps) {
  const VisibilityIcon = getVisibilityIcon(space.type);

  return (
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
          <p className="mt-1 text-lg font-bold text-foreground">{space._count?.chats ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2 text-xs border-t border-border/40">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={VisibilityIcon} size={13} />
            Visibility
          </span>
          <span className="font-mono font-medium text-foreground uppercase">{space.type}</span>
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
  );
}
