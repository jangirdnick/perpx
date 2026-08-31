import { Badge } from '@/components/ui/badge';
import type { SpaceMember } from '@perpx/shared';

interface SpaceMembersListProps {
  spaceMembers?: SpaceMember[];
}

export function SpaceMembersList({ spaceMembers }: SpaceMembersListProps) {
  if (!spaceMembers || spaceMembers.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-2xs backdrop-blur-xs font-sora">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Members ({spaceMembers.length})</h2>
      </div>

      <div className="divide-y divide-border/40">
        {spaceMembers.map((member: SpaceMember) => (
          <div
            key={member.id}
            className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                {member.user?.fullname ? member.user.fullname.charAt(0).toUpperCase() : 'U'}
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
  );
}
