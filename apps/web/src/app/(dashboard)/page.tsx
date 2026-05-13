'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  AttachmentIcon,
  Cancel01Icon,
  Globe02Icon,
  Mic01Icon,
  SentIcon,
} from '@hugeicons/core-free-icons';

import { useAppSelector } from '../../store/hooks';
import MessageBox from '../../modules/layout/components/messagebox/message-box';
import { useChat } from '../../modules/chat/hooks/useChat';

const MIN_ROWS = 2.5;
const MAX_ROWS = 24;
const LINE_HEIGHT = 24;

interface UploadedFile {
  file: File;
  preview: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { sendMessage } = useChat();

  const { activeChatId } = useAppSelector((state) => state.chat);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const hasMessage = useMemo(() => query.trim().length > 0 || files.length > 0, [query, files]);

  const resizeTextarea = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';

    const clamped = Math.min(
      Math.max(el.scrollHeight, MIN_ROWS * LINE_HEIGHT),
      MAX_ROWS * LINE_HEIGHT,
    );

    el.style.height = `${clamped}px`;
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuery(e.target.value);
      resizeTextarea(e.target);
    },
    [resizeTextarea],
  );

  const handleSend = () => {
    if (!hasMessage) return;

    sendMessage({
      chatId: activeChatId || undefined,
      message: query,
    });

    console.warn({
      query,
      webSearch,
      files,
    });

    setQuery('');
    setFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_ROWS * LINE_HEIGHT}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const mappedFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...mappedFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      files.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [files]);

  return (
    <section className="min-h-dvh w-full bg-background">
      <div
        className={cn(
          'mx-auto flex w-full max-w-3xl flex-col px-4 md:px-0',
          activeChatId
            ? 'h-dvh min-h-dvh py-2 gap-8'
            : 'min-h-dvh items-center justify-center py-10',
        )}
      >
        {activeChatId ? (
          <>
            <div className="min-h-0 flex-1">
              <MessageBox chatId={activeChatId} />
            </div>

            <div className="sticky bottom-0 z-20 pt-3">
              <div className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-background via-background/80 to-transparent" />

              <Composer
                query={query}
                files={files}
                webSearch={webSearch}
                textareaRef={textareaRef}
                hasMessage={hasMessage}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onToggleWeb={() => setWebSearch((v) => !v)}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 flex flex-col items-center text-center">
              <h1 className="bg-gradient-to-b from-foreground to-muted-foreground/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent">
                perpx
              </h1>

              <p className="mt-2 text-[11px] text-muted-foreground">
                AI workspace for research & productivity
              </p>
            </div>

            <div className="w-full max-w-4xl">
              <Composer
                query={query}
                files={files}
                webSearch={webSearch}
                textareaRef={textareaRef}
                hasMessage={hasMessage}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onSend={handleSend}
                onToggleWeb={() => setWebSearch((v) => !v)}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
              />
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Shift + Enter for new line</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

interface ComposerProps {
  query: string;
  webSearch: boolean;
  files: UploadedFile[];
  hasMessage: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onToggleWeb: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

function Composer({
  query,
  webSearch,
  files,
  hasMessage,
  textareaRef,
  onInput,
  onKeyDown,
  onSend,
  onToggleWeb,
  onFileChange,
  onRemoveFile,
}: ComposerProps) {
  return (
    <div className="w-full rounded-md border border-border bg-card/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80">
      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-4">
          {files.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className="group relative shrink-0 overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src={item.preview}
                alt={item.file.name}
                width={80}
                height={80}
                className="h-20 w-20 object-cover"
              />

              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                aria-label={`Remove ${item.file.name}`}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/85 text-muted-foreground opacity-100 backdrop-blur-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

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

      <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border px-3 py-3">
        <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <input type="file" multiple accept="image/*" onChange={onFileChange} className="hidden" />
          <HugeiconsIcon icon={AttachmentIcon} size={14} />
        </label>

        <button
          type="button"
          onClick={onToggleWeb}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-full border px-3 text-[11px] transition-colors',
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
        </button>

        <button
          type="button"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Voice input"
        >
          <HugeiconsIcon icon={Mic01Icon} size={14} />
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={!hasMessage}
          aria-label="Send message"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed',
            hasMessage
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <HugeiconsIcon icon={SentIcon} size={14} />
        </button>
      </div>
    </div>
  );
}
