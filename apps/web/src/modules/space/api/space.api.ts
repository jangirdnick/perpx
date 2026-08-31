import { api } from '../../../lib/axios';
import { SpaceResponse, SpaceListResponse } from '@perpx/shared/types/space.type';

export type CreateSpacePayload = {
  title: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE' | 'GROUP';
};

export type UpdateSpacePayload = Partial<CreateSpacePayload>;

export async function createSpace(payload: CreateSpacePayload): Promise<SpaceResponse> {
  const { data } = await api.post('/space', payload);
  return data;
}

export async function updateSpace(
  spaceId: string,
  payload: UpdateSpacePayload,
): Promise<SpaceResponse> {
  const { data } = await api.patch(`/space/${spaceId}`, payload);
  return data;
}

export async function getSpaces(): Promise<SpaceListResponse> {
  const { data } = await api.get('/space');
  return data;
}

export async function getSpacesInfinite({
  pageParam,
  limit = 20,
}: {
  pageParam?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (pageParam) params.append('cursor', pageParam);
  if (limit) params.append('limit', limit.toString());
  const { data } = await api.get(`/space?${params.toString()}`);
  return data as import('@perpx/shared/types/space.type').SpaceInfiniteResponse;
}

export async function getSpaceById(spaceId: string): Promise<SpaceResponse> {
  const { data } = await api.get(`/space/${spaceId}`);
  return data;
}

export async function deleteSpace(spaceId: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`/space/${spaceId}`);
  return data;
}
