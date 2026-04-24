import { SubscriptionPlan, UserRole } from '@prisma/client';

export type User = {
  id: string;
  fullname: string;
  username: string;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
  role: UserRole;
  subscription: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
};

export type JWTUser = {
  id: string;
  fullname: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  subscription: SubscriptionPlan;
};
