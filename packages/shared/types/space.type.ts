import { ApiSuccessResponse, ApiErrorResponse } from './api.type';

export type SpaceType = 'PUBLIC' | 'PRIVATE' | 'GROUP';
export type SpaceMemberRole = 'ADMIN' | 'MEMBER';

export type SpaceMemberUser = {
  id?: string;
  fullname?: string | null;
  username?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export type SpaceMember = {
  id: string;
  role: SpaceMemberRole;
  userId: string;
  spaceId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: SpaceMemberUser;
};

export type SpaceCount = {
  chats?: number;
  spaceMembers?: number;
};

export type Space = {
  id: string;
  title: string;
  description: string;
  type: SpaceType;
  createdAt: string;
  updatedAt: string;
  spaceMembers?: SpaceMember[];
  _count?: SpaceCount;
};

export type SpaceResponse = ApiSuccessResponse<{ space: Space }> | ApiErrorResponse;
export type SpaceListResponse = ApiSuccessResponse<{ spaces: Space[] }> | ApiErrorResponse;
