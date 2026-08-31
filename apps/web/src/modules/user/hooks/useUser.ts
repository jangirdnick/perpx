import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAccountApi, updateMeApi } from '../api/user.api';
import { UpdateUserRequest, UpdateUserResponse } from '@perpx/shared';
import { useAppDispatch } from '../../../store/hooks';
import { setUser } from '../../auth/slices/authSlice';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { getErrorMessage } from '../../auth/api/auth.error.api';

export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<UpdateUserResponse, AxiosError, UpdateUserRequest>({
    mutationFn: (payload) => updateMeApi(payload),
    onSuccess: (data) => {
      dispatch(setUser(data.data.user));
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success(data.message || 'Profile updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to update profile');
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: (data: { success: boolean; message: string }) => {
      queryClient.clear();
      toast.success(data.message || 'Account deleted successfully');
      window.location.href = '/account/login';
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || 'Failed to delete account');
    },
  });
};
