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

export type ResponseUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  subscription: SubscriptionPlan;
};

export type UpdateUserRequest = {
  fullname?: string;
};

export type UpdateUserResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
};
