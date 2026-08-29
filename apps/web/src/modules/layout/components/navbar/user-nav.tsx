import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  ComputerIcon,
  Logout02Icon,
  Moon02Icon,
  Settings02Icon,
  SlidersHorizontalIcon,
  Sun03Icon,
  UploadCircle01Icon,
} from '@hugeicons/core-free-icons';

import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';

import { useAppSelector } from '../../../../store/hooks';
import { Button } from '../../../../components/ui/button';
import { useLogout } from '../../../auth/hooks/useAuth';

import { cn } from '@/lib/utils';

interface UserNavProps {
  isCollapsed: boolean;
}

const menuIconClass = 'size-4 text-muted-foreground';
const menuItemClass = 'cursor-pointer rounded-lg py-2.5 transition-colors';

export default function UserNav({ isCollapsed }: UserNavProps) {
  const { theme, setTheme } = useTheme();

  const { user } = useAppSelector((state) => state.auth);
  const { mutate, isPending } = useLogout();

  const userInitial =
    user?.fullname
      ?.trim()
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`
            flex w-full h-fit items-center gap-2 rounded-xl
            py-1 px-1
            transition-all duration-200
            bg-transparent
            hover:bg-accent/40
          `}
        >
          {/* Avatar */}
          <Avatar className={`${isCollapsed ? '' : 'size-10'} border ease-in-out`}>
            <AvatarImage src={user?.avatar || ''} alt={user?.fullname || 'User avatar'} />

            <AvatarFallback className={`${isCollapsed ? 'text-[10px]' : 'text-xs'} font-semibold`}>
              {userInitial}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          {!isCollapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-xs text-muted-foreground font-medium">{user?.fullname}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border bg-sidebar/95 backdrop-blur-md p-2 z-50"
      >
        {/* User Card */}
        <div className="flex items-center gap-3 rounded-xl p-3">
          <Avatar className="size-11 border">
            <AvatarImage src={user?.avatar || ''} alt={user?.fullname || 'User avatar'} />

            <AvatarFallback className="font-semibold">{userInitial}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.fullname}</p>

            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Settings */}
        <DropdownMenuItem className={menuItemClass}>
          <HugeiconsIcon icon={Settings02Icon} className={menuIconClass} />

          <span>All Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Upgrade */}
        <DropdownMenuItem
          className="
            cursor-pointer rounded-xl p-3.5
            focus:bg-accent
          "
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex size-7 items-center justify-center
                  rounded-full bg-primary/10
                "
              >
                <HugeiconsIcon icon={UploadCircle01Icon} className="size-3.5" />
              </div>

              <span className="text-sm font-semibold">Upgrade Plan</span>
            </div>

            <p className="pl-9 text-xs leading-relaxed text-muted-foreground">
              Unlock premium features and unlimited workspace access.
            </p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Appearance Responsive Inline Selector */}
        <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <HugeiconsIcon icon={SlidersHorizontalIcon} className={menuIconClass} />
            <span>Appearance</span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md text-xs transition-colors cursor-pointer',
                theme === 'light'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="Light Mode"
            >
              <HugeiconsIcon icon={Sun03Icon} className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md text-xs transition-colors cursor-pointer',
                theme === 'dark'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="Dark Mode"
            >
              <HugeiconsIcon icon={Moon02Icon} className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md text-xs transition-colors cursor-pointer',
                theme === 'system'
                  ? 'bg-background text-foreground shadow-2xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              title="System Theme"
            >
              <HugeiconsIcon icon={ComputerIcon} className="size-3.5" />
            </button>
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* Logout */}
        <DropdownMenuItem
          variant="destructive"
          className={menuItemClass}
          onClick={() => mutate()}
          disabled={isPending}
        >
          <HugeiconsIcon icon={Logout02Icon} className="size-4" />

          <span>{isPending ? 'Logging out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
