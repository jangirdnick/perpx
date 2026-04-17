import { UserRole } from '@prisma/client';

export type User = {
  id: string;
  fullname: string;
  username: string;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
