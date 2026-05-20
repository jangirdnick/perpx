import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import type { UploadedFile } from '../../types/index';

interface UploadedFilesPreviewProps {
  files: UploadedFile[];
  onRemoveFile: (index: number) => void;
}

export function UploadedFilesPreview({ files, onRemoveFile }: UploadedFilesPreviewProps) {
  if (!files.length) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pt-4">
      {files.map((item, index) => (
        <div
          key={`${item.fileUrl}-${index}`}
          className="group relative flex min-w-22 shrink-0 flex-col overflow-hidden rounded-md border border-border bg-muted/30"
        >
          {item.fileUrl ? (
            <Image
              src={item.fileUrl}
              alt={item.name.slice(0, 16) || 'file'}
              width={80}
              height={80}
              unoptimized
              className="h-20 w-20 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
              {item.name.slice(0, 16) || 'file'}
            </div>
          )}

          <button
            type="button"
            onClick={() => onRemoveFile(index)}
            aria-label={`Remove ${item.name.slice(0, 16) || 'file'}`}
            className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-destructive/10 text-muted-foreground backdrop-blur-sm transition-all hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
