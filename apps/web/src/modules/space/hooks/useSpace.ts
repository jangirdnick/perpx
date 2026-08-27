import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSpace, CreateSpacePayload, getSpaceById, getSpaces } from '../api/space.api';
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
