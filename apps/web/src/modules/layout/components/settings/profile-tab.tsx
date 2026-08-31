'use client';

import { useState } from 'react';
import { useAppSelector } from '../../../../store/hooks';
import { useDeleteAccount, useUpdateMe } from '../../../user/hooks/useUser';
import { useLogoutAllDevice } from '../../../auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

interface ProfileTabProps {
  open: boolean;
}

export function ProfileTab({ open }: ProfileTabProps) {
  const user = useAppSelector((state) => state.auth.user);

  const { mutate: updateMe, isPending: isUpdating } = useUpdateMe();
  const { mutate: logoutAllDevices, isPending: isLoggingOut } = useLogoutAllDevice();
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount();

  const [fullname, setFullname] = useState(user?.fullname || '');
  const [prevFullname, setPrevFullname] = useState(user?.fullname);
  const [prevOpen, setPrevOpen] = useState(open);

  if (user?.fullname !== prevFullname || open !== prevOpen) {
    setPrevFullname(user?.fullname);
    setPrevOpen(open);
    setFullname(user?.fullname || '');
  }

  const userInitial =
    user?.fullname
      ?.trim()
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('') || 'U';

  const handleUpdateProfile = () => {
    if (!fullname.trim()) return;
    updateMe({ fullname });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
        <Avatar className="size-14 border border-border">
          <AvatarImage src={user?.avatar || ''} alt={user?.fullname || 'Avatar'} />
          <AvatarFallback className="font-semibold text-base">{userInitial}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base truncate">{user?.fullname || 'User'}</h4>
            <Badge
              variant="secondary"
              className="text-[10px] uppercase font-semibold bg-primary/10 text-primary border-primary/20"
            >
              {user?.role || 'Member'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs shrink-0"
          onClick={() => toast.info('Avatar upload feature coming soon')}
        >
          Change Avatar
        </Button>
      </div>

      <div className="w-full flex flex-col gap-6">
        {/* Full Name */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <p className="text-xs text-muted-foreground">Your display name across workspace</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-[60%]">
            <Input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Your full name"
              className="bg-secondary/40 border-border/40 text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
            />
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating || fullname === user?.fullname || !fullname.trim()}
              variant="secondary"
              size="sm"
              className="text-xs shrink-0"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Email Address */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-sm font-medium text-foreground">Email address</label>
            <p className="text-xs text-muted-foreground">Used for login and notifications</p>
          </div>
          <div className="w-full sm:w-[60%] flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground break-all">{user?.email}</span>
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/10 shrink-0 gap-1"
            >
              <HugeiconsIcon icon={Tick02Icon} className="size-3" /> Verified
            </Badge>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Log Out All Devices */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-sm font-medium text-foreground">Log out of all devices</label>
            <p className="text-xs text-muted-foreground">
              Revoke all active sessions across all devices
            </p>
          </div>
          <div className="w-full sm:w-fit">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Log out all'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out of all devices?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end your active session on all computers and mobile devices where you
                    are logged in.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    className="text-xs"
                    onClick={() => logoutAllDevices()}
                  >
                    Log Out All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Delete Account */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="text-sm font-medium text-destructive">Delete account</label>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all data
            </p>
          </div>
          <div className="w-full sm:w-fit">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border-none"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure? This action cannot be undone. All your profile information,
                    spaces, and chat history will be erased forever.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    className="text-xs"
                    onClick={() => deleteAccount()}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
