import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateSpace } from '../../hooks/useSpace';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const editSpaceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['PUBLIC', 'PRIVATE', 'GROUP']),
});
type EditSpaceFormValues = z.infer<typeof editSpaceSchema>;

interface EditSpaceModalProps {
  spaceId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    title: string;
    description: string;
    type: 'PUBLIC' | 'PRIVATE' | 'GROUP';
  };
}

export function EditSpaceModal({
  spaceId,
  isOpen,
  onOpenChange,
  initialData,
}: EditSpaceModalProps) {
  const { mutate: updateSpaceMutate, isPending: isUpdating } = useUpdateSpace();

  const editForm = useForm<EditSpaceFormValues>({
    resolver: zodResolver(editSpaceSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'PRIVATE',
    },
  });

  useEffect(() => {
    if (initialData) {
      editForm.reset({
        title: initialData.title,
        description: initialData.description || '',
        type: initialData.type,
      });
    }
  }, [initialData, editForm]);

  const onEditSubmit = (values: EditSpaceFormValues) => {
    updateSpaceMutate(
      { spaceId, payload: values },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl font-sora">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Edit Space</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Make changes to your space details here.
          </DialogDescription>
        </DialogHeader>
        <Form {...editForm}>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-2">
            <FormField
              control={editForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Space title..."
                      className="text-xs rounded-xl"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage name="title" className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is this space for?"
                      className="text-xs rounded-xl resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage name="description" className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-xs rounded-xl">
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private (Only me)</SelectItem>
                      <SelectItem value="GROUP">Group (Invited members)</SelectItem>
                      <SelectItem value="PUBLIC">Public (Anyone with link)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage name="type" className="text-[10px]" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="text-xs rounded-lg gap-2 cursor-pointer"
              >
                {isUpdating ? (
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
