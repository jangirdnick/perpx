import { api } from '../../../lib/axios';
import { SpaceResponse, SpaceListResponse } from '@perpx/shared/types/space.type';

export type CreateSpacePayload = {
  title: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE' | 'GROUP';
};

export async function createSpace(payload: CreateSpacePayload): Promise<SpaceResponse> {
  const { data } = await api.post('/space', payload);
  return data;
}

export async function getSpaces(): Promise<SpaceListResponse> {
  const { data } = await api.get('/space');
  return data;
}

export async function getSpaceById(spaceId: string): Promise<SpaceResponse> {
  const { data } = await api.get(`/space/${spaceId}`);
  return data;
}
