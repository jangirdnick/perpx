'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AttachmentIcon, Image02Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

type FileSelectorProps = {
  onFileChange: (files: File[]) => void;
};

export default function FileSelector({ onFileChange }: FileSelectorProps) {
  const docsInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileChange(Array.from(files));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" type="button" className="rounded-full">
          <HugeiconsIcon icon={PlusSignIcon} size={14} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-52 p-1">
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            docsInputRef.current?.click();
          }}
        >
          <HugeiconsIcon icon={AttachmentIcon} size={14} />
          <span>Add files</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            imageInputRef.current?.click();
          }}
        >
          <HugeiconsIcon icon={Image02Icon} size={14} />
          <span>Add image</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <input
        ref={docsInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.md"
        className="hidden"
        onChange={(e) => {
          handleInputChange(e.target.files);
          e.target.value = '';
        }}
      />

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleInputChange(e.target.files);
          e.target.value = '';
        }}
      />
    </DropdownMenu>
  );
}
