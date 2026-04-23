import * as z from 'zod';

export const registerSchema = z
  .object({
    fullname: z
      .string()
      .min(3, 'Full name must be at least 3 characters')
      .max(50, 'Full name too long'),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore allowed'),

    email: z.string().email('Invalid email address').toLowerCase(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[0-9]/, 'Must include at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must include at least one special character'),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const sendNewEmailSchema = z.object({
  email: z.string().email('Invalid email'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type SendNewEmailSchema = z.infer<typeof sendNewEmailSchema>;
