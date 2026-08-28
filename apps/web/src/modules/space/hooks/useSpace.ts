import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  createSpace,
  CreateSpacePayload,
  deleteSpace,
  getSpaceById,
  getSpaces,
  getSpacesInfinite,
} from '../api/space.api';
import { toast } from 'sonner';
import { getErrorMessage } from '../../auth/api/auth.error.api';

export const useCreateSpace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSpacePayload) => createSpace(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Space created successfully');
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
        queryClient.invalidateQueries({ queryKey: ['spaces-infinite'] });
      } else {
        toast.error(data.message || 'Failed to create space');
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to create space');
    },
  });
};

export const useGetSpaces = () => {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const data = await getSpaces();
      return data;
    },
  });
};

export const useInfiniteSpaces = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['spaces-infinite', limit],
    queryFn: ({ pageParam }) => getSpacesInfinite({ pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.success && lastPage.data?.nextCursor ? lastPage.data.nextCursor : undefined,
  });
};

export const useGetSpaceById = (spaceId: string) => {
  return useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const data = await getSpaceById(spaceId);
      return data;
    },
    enabled: !!spaceId,
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (spaceId: string) => deleteSpace(spaceId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Space deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
        queryClient.invalidateQueries({ queryKey: ['spaces-infinite'] });
        router.push('/spaces');
      } else {
        toast.error(data.message || 'Failed to delete space');
      }
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to delete space');
    },
  });
};
