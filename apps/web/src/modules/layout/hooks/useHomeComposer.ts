import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { useAppSelector } from '../../../store/hooks';
import { useChat } from '../../chat/hooks/useChat';
import { useGetUploadURL, useUploadFile } from './useLayout';
import { MAX_ROWS, MIN_ROWS, LINE_HEIGHT } from '../types/index';
import type { UploadedFile } from '../types/index';
import { getErrorMessage } from '../../auth/api/auth.error.api';

export function useHomeComposer() {
  const [query, setQuery] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { sendMessage } = useChat();
  const { activeChatId, isStreaming } = useAppSelector((state) => state.chat);
  const getUploadURLMutation = useGetUploadURL();
  const uploadFileMutation = useUploadFile();

  const hasMessage = useMemo(() => query.trim().length > 0 || files.length > 0, [query, files]);

  const resizeTextarea = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(
      Math.max(el.scrollHeight, MIN_ROWS * LINE_HEIGHT),
      MAX_ROWS * LINE_HEIGHT,
    )}px`;
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuery(e.target.value);
      resizeTextarea(e.target);
    },
    [resizeTextarea],
  );

  const handleSend = useCallback(() => {
    if (!hasMessage || isStreaming) return;

    sendMessage({
      chatId: activeChatId || undefined,
      message: query,
      webSearch,
      attachments: files,
    });

    setQuery('');
    setFiles([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_ROWS * LINE_HEIGHT}px`;
    }
  }, [activeChatId, files, hasMessage, isStreaming, query, sendMessage, webSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleFileChange = useCallback(
    async (selectedFiles: File[]) => {
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          let fileToUpload = file;

          if (file.type.startsWith('image/')) {
            fileToUpload = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            });
          }

          const uploadResults = await getUploadURLMutation.mutateAsync({
            fileName: fileToUpload.name,
            fileType: fileToUpload.type,
          });

          if (!uploadResults.success) {
            throw new Error('Failed to generate upload URL');
          }

          await uploadFileMutation.mutateAsync({
            url: uploadResults.data.signedUrl,
            file: fileToUpload,
          });

          return {
            fileUrl: uploadResults.data.fileUrl,
            type: fileToUpload.type,
            name: fileToUpload.name,
          };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        setFiles((prev) => [...prev, ...uploadedFiles]);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error) || 'File service failed. Please try again later.');
      }
    },
    [getUploadURLMutation, uploadFileMutation],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.fileUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(item.fileUrl);
        }
      });
    };
  }, [files]);

  return {
    query,
    webSearch,
    files,
    hasMessage,
    isStreaming,
    textareaRef,
    onInput: handleInput,
    onKeyDown: handleKeyDown,
    onSend: handleSend,
    onToggleWeb: () => setWebSearch((v) => !v),
    onFileChange: handleFileChange,
    onRemoveFile: removeFile,
  };
}
