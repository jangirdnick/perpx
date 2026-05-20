import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp02Icon, Globe02Icon, Mic01Icon } from '@hugeicons/core-free-icons';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import FileSelector from './file-selector';
import { UploadedFilesPreview } from './uploaded-files-preview';
import { MIN_ROWS, LINE_HEIGHT } from '../../types/index';
import type { UploadedFile } from '../../types/index';

interface ChatComposerProps {
  query: string;
  webSearch: boolean;
  files: UploadedFile[];
  hasMessage: boolean;
  isStreaming: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onToggleWeb: () => void;
  onFileChange: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
}

export function ChatComposer({
  query,
  webSearch,
  files,
  hasMessage,
  textareaRef,
  isStreaming,
  onInput,
  onKeyDown,
  onSend,
  onToggleWeb,
  onFileChange,
  onRemoveFile,
}: ChatComposerProps) {
  return (
    <div className="w-full rounded-md border border-border/80 bg-card/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80">
      <UploadedFilesPreview files={files} onRemoveFile={onRemoveFile} />

      <div className="px-4 pt-4">
        <Textarea
          ref={textareaRef}
          value={query}
          onChange={onInput}
          onKeyDown={onKeyDown}
          rows={MIN_ROWS}
          placeholder="Ask anything..."
          style={{ height: `${MIN_ROWS * LINE_HEIGHT}px` }}
          className="min-h-11 resize-none overflow-y-auto border-none bg-transparent! px-0 py-0 text-sm! leading-6 text-foreground shadow-none outline-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-3 py-3">
        <FileSelector onFileChange={onFileChange} />

        <Button
          type="button"
          variant="secondary"
          onClick={onToggleWeb}
          className={cn(
            'flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[11px] transition-colors',
            webSearch
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-border bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          )}
        >
          <div
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              webSearch ? 'bg-emerald-500' : 'bg-muted-foreground/40',
            )}
          />
          <HugeiconsIcon icon={Globe02Icon} size={12} />
          Web
        </Button>

        <Button
          type="button"
          className="ml-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Voice input"
        >
          <HugeiconsIcon icon={Mic01Icon} size={14} />
        </Button>

        <Button
          type="button"
          onClick={onSend}
          disabled={!hasMessage || isStreaming}
          aria-label="Send message"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed',
            hasMessage && !isStreaming
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <HugeiconsIcon icon={ArrowUp02Icon} size={14} />
        </Button>
      </div>
    </div>
  );
}
