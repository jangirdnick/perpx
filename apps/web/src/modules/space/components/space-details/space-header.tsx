import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Folder01Icon,
  User02Icon,
  Edit03Icon,
  Globe02Icon,
  UserGroupIcon,
  LockedIcon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditSpaceModal } from './edit-space-modal';

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

interface SpaceHeaderProps {
  space: {
    id: string;
    title: string;
    description: string | null;
    type: 'PUBLIC' | 'PRIVATE' | 'GROUP';
  };
  userRole: 'ADMIN' | 'MEMBER' | string;
}

export function SpaceHeader({ space, userRole }: SpaceHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const VisibilityIcon = getVisibilityIcon(space.type);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-2xs backdrop-blur-xs">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={Folder01Icon} size={24} />
          </div>
          <div className="flex-1">
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
          {userRole === 'ADMIN' && (
            <Button
              variant="secondary"
              size="sm"
              className="w-9 h-9 gap-2 ml-auto shrink-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-full"
              onClick={() => setIsEditModalOpen(true)}
            >
              <HugeiconsIcon icon={Edit03Icon} size={16} />
            </Button>
          )}
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

      <EditSpaceModal
        spaceId={space.id}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={{
          title: space.title,
          description: space.description || '',
          type: space.type,
        }}
      />
    </>
  );
}
