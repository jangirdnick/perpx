import { UpdateUserRequest, UpdateUserResponse } from '@perpx/shared';
import { api } from '../../../lib/axios';

export async function updateMeApi(payload: UpdateUserRequest): Promise<UpdateUserResponse> {
  const { data } = await api.patch('/user/me', payload);
  return data;
}

export async function deleteAccountApi() {
  const { data } = await api.delete('/user/me');
  return data;
}
