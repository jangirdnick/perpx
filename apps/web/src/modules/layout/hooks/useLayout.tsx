'use client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getUploadURL, uploadFile } from '../api/layout.api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../auth/api/auth.error.api';

export const useGetUploadURL = () => {
  return useMutation({
    mutationFn: async ({ fileName, fileType }: { fileName: string; fileType: string }) =>
      await getUploadURL(fileName, fileType),
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.error || 'File service failed. Please try again later.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ url, file }: { url: string; file: File }) => await uploadFile(url, file),
    onSuccess: (data) => {
      if (!data) {
        toast.error('File service failed. Please try again later.');
      }
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
    },
  });
};
