'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSpace } from '../hooks/useSpace';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Loading03Icon } from '@hugeicons/core-free-icons';
import { SpaceType } from '@perpx/shared';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['PUBLIC', 'PRIVATE', 'GROUP']),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateSpaceModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createSpace, isPending } = useCreateSpace();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'PRIVATE',
    },
  });

  const onSubmit = (values: FormValues) => {
    createSpace(values, {
      onSuccess: (data) => {
        if (data.success) {
          setOpen(false);
          form.reset();
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1 rounded-lg px-2 py-4">
          <HugeiconsIcon className="w-3! h-3!" icon={PlusSignIcon} size={16} strokeWidth={2} />
          <span className="font-sora text-xs">New Space</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="font-sora text-lg">Create a new space</DialogTitle>
          <DialogDescription className="text-xs">
            Spaces allow you to organize your conversations and collaborate with others.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-sora text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Project Alpha"
              {...form.register('title')}
              className="rounded-lg border-border font-sora text-xs p-2 h-auto"
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-sora text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="What is this space for?"
              {...form.register('description')}
              className="resize-none rounded-lg border-border font-sora text-xs p-2"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="font-sora text-sm font-medium">
              Visibility
            </Label>
            <Select
              onValueChange={(value) => form.setValue('type', value as SpaceType)}
              defaultValue={form.getValues('type')}
            >
              <SelectTrigger className="rounded-lg border-border font-sora text-xs px-3 py-3 h-auto">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border bg-card/95 backdrop-blur-md font-sora text-sm">
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="GROUP">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between w-full pt-4">
            <Button
              type="button"
              variant={'destructive'}
              onClick={() => setOpen(false)}
              className="font-sora px-2 py-4 rounded-lg"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending} className="font-sora px-2 py-4  rounded-lg ">
              {isPending ? (
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Space'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSpaceModal;
