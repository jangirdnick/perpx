import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Delete02Icon, MoreHorizontalIcon, Pen01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useDeleteChat } from '../../../chat/hooks/useChat';

interface ActionButtonProps {
  chatId: string;
}

export default function ActionButton({ chatId }: ActionButtonProps) {
  const deleteChat = useDeleteChat();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant={'outline'}
          className="bg-muted hover:bg-muted/80 border-border outline-none"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={8} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="z-9999">
        <DropdownMenuItem>
          <HugeiconsIcon icon={Pen01Icon} />
          Rename
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" onClick={() => deleteChat.mutate(chatId)}>
          <HugeiconsIcon icon={Delete02Icon} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
