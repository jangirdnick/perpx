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
          className="bg-primary border-none outline-none backdrop-blur-md"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={8} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60">
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
