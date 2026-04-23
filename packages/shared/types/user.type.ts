type UserRole = 'USER' | 'ADMIN';

type SubscriptionPlan = 'NORMAL' | 'PLUS' | 'MAX';

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
