'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Delete02Icon,
  MoreHorizontalIcon,
  Pen01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDeleteChat, useRenameChat } from '../../../chat/hooks/useChat';
import { Chat } from '@perpx/shared/types/chat.type';

interface ActionButtonProps {
  chat: Chat;
}

export default function ActionButton({ chat }: ActionButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isDeleting, setIsDeleting] = useState(false);

  const renameChatMutation = useRenameChat();
  const deleteChatMutation = useDeleteChat();

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    renameChatMutation.mutate(
      { chatId: chat.id, title: editTitle.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    deleteChatMutation.mutate(chat.id, {
      onSuccess: () => {
        setIsDeleting(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6 bg-muted hover:bg-muted/80 border-border outline-none cursor-pointer"
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} size={12} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="z-9999 font-sora">
          <DropdownMenuItem
            onClick={() => {
              setEditTitle(chat.title);
              setIsEditing(true);
            }}
            className="cursor-pointer gap-2 text-xs"
          >
            <HugeiconsIcon icon={Pen01Icon} size={14} />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setIsDeleting(true)}
            className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
          >
            <HugeiconsIcon icon={Delete02Icon} size={14} />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Title Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md rounded-2xl font-sora z-99999">
          <DialogHeader>
            <DialogTitle className="text-lg">Rename Chat</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter a new title for this conversation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="chat-rename-input" className="text-xs font-medium">
                Title
              </Label>
              <Input
                id="chat-rename-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter new title..."
                className="text-xs rounded-xl"
                autoFocus
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={renameChatMutation.isPending || !editTitle.trim()}
                className="text-xs rounded-lg gap-2 cursor-pointer"
              >
                {renameChatMutation.isPending ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation AlertDialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="sm:max-w-md rounded-2xl font-sora z-99999">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to delete &quot;{chat.title}&quot;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-between w-full pt-4">
            <AlertDialogCancel className="text-xs rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteChatMutation.isPending}
              className="text-xs rounded-lg cursor-pointer"
            >
              {deleteChatMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete Chat'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
