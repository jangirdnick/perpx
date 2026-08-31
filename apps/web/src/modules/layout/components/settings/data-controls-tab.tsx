'use client';

import { useState } from 'react';
import { useAppSelector } from '../../../../store/hooks';
import { useClearAllChats } from '../../../chat/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

interface DataControlsTabProps {
  onOpenChange: (open: boolean) => void;
}

export function DataControlsTab({ onOpenChange }: DataControlsTabProps) {
  const user = useAppSelector((state) => state.auth.user);
  const { mutate: clearAllChats, isPending: isClearingChats } = useClearAllChats();
  const [shareData, setShareData] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-6">
        {/* Model Training Opt-out */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Improve models for everyone</p>
            <p className="text-xs text-muted-foreground">
              Allow Perpx to use your chats to train AI models
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShareData(!shareData)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
              shareData ? 'bg-primary' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                shareData ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        <Separator className="bg-border/40" />

        {/* Export Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Export account data</p>
            <p className="text-xs text-muted-foreground">
              Download a JSON archive of your history & spaces
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => {
              toast.info('Downloading your account data archive...');
              const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(user || {}, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', 'perpx-user-export.json');
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          >
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" />
            Export Data
          </Button>
        </div>

        <Separator className="bg-border/40" />

        {/* Clear Chat History */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Clear all chat history</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete all prompt history from your account
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive gap-1.5"
                disabled={isClearingChats}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                {isClearingChats ? 'Clearing...' : 'Clear All Chats'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your conversation history across all spaces. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="text-xs"
                  onClick={() => {
                    clearAllChats();
                    onOpenChange(false);
                  }}
                >
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
