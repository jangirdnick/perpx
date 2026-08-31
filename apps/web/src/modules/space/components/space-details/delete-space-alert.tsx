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
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { useDeleteSpace } from '../../hooks/useSpace';

interface DeleteSpaceAlertProps {
  spaceId: string;
}

export function DeleteSpaceAlert({ spaceId }: DeleteSpaceAlertProps) {
  const { mutate: deleteSpaceMutate, isPending: isDeleting } = useDeleteSpace();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-lg font-sora text-xs px-2 py-1.5 h-auto cursor-pointer"
        >
          {isDeleting ? (
            <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
          ) : (
            <HugeiconsIcon icon={Delete02Icon} size={14} />
          )}
          <span>Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md rounded-2xl border-border bg-card/95 backdrop-blur-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sora text-lg">Delete space</AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Are you sure you want to delete this space? This action cannot be undone and will
            permanently remove all related space data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center justify-between w-full pt-4 sm:justify-between font-sora">
          <AlertDialogCancel className="font-sora px-2 py-4 rounded-lg text-xs cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => deleteSpaceMutate(spaceId)}
            className="font-sora px-2 py-4 rounded-lg text-xs cursor-pointer"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete Space'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
