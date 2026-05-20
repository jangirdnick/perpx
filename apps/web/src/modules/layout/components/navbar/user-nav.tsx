import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

interface UserNavProps {
  isCollapsed: boolean;
}

const menuIconClass = 'size-4 text-muted-foreground';
const menuItemClass = 'cursor-pointer rounded-lg py-2.5 transition-colors';

export default function UserNav({ isCollapsed }: UserNavProps) {
  const { setTheme } = useTheme();

  const { user } = useAppSelector((state) => state.auth);

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
            flex w-full h-fit items-center gap-3 rounded-xl
            py-1
            transition-all duration-200
            bg-transparent
            hover:bg-accent
            // focus:outline-none
            // focus:ring-2 focus:ring-ring
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
        sideOffset={10}
        className="w-80 rounded-2xl border bg-background p-2 shadow-2xl"
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
            cursor-pointer rounded-xl p-4
            focus:bg-accent
          "
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex size-8 items-center justify-center
                  rounded-full bg-primary/10
                "
              >
                <HugeiconsIcon icon={UploadCircle01Icon} className="size-4" />
              </div>

              <span className="text-sm font-semibold">Upgrade Plan</span>
            </div>

            <p className="pl-10 text-xs leading-relaxed text-muted-foreground">
              Unlock premium features and unlimited workspace access.
            </p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        {/* Appearance */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`${menuItemClass} gap-2`}>
            <HugeiconsIcon icon={SlidersHorizontalIcon} className={menuIconClass} />

            <span>Appearance</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-48 rounded-xl p-2">
            <DropdownMenuItem onClick={() => setTheme('light')} className={menuItemClass}>
              <HugeiconsIcon icon={Sun03Icon} className={menuIconClass} />

              <span>Light</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setTheme('dark')} className={menuItemClass}>
              <HugeiconsIcon icon={Moon02Icon} className={menuIconClass} />

              <span>Dark</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setTheme('system')} className={menuItemClass}>
              <HugeiconsIcon icon={ComputerIcon} className={menuIconClass} />

              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="my-2" />

        {/* Logout */}
        <DropdownMenuItem variant="destructive" className={menuItemClass}>
          <HugeiconsIcon icon={Logout02Icon} className="size-4" />

          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
