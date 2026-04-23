'use client';

import { Form } from '@/components/ui/form';
import FormInput from '@/components/shared/form/form.input';
import { Button } from '@/components/ui/button';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  registerSchema,
  loginSchema,
  sendNewEmailSchema,
  RegisterSchema,
  LoginSchema,
  SendNewEmailSchema,
} from '@/modules/auth/schemas/auth.schema';
import {
  Loading03Icon,
  LockPasswordIcon,
  Login02Icon,
  Mail01Icon,
  User03Icon,
  UserLock01Icon,
} from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { useLogin, useRegester, useSendNewVerifyEmail } from '../hooks/useAuth';
import { HugeiconsIcon } from '@hugeicons/react';

interface AuthFormProps {
  type: 'Register' | 'Login' | 'SendNewEmail';
}

export default function AuthForm({ type }: AuthFormProps) {
  const isRegister = type === 'Register';
  const isLogin = type === 'Login';
  const isSendNewEmail = type === 'SendNewEmail';

  const schema = isRegister ? registerSchema : isLogin ? loginSchema : sendNewEmailSchema;

  type AuthFormData = RegisterSchema | LoginSchema | SendNewEmailSchema;

  const form = useForm<AuthFormData>({
    resolver: zodResolver(schema),
    defaultValues: isRegister
      ? {
          fullname: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        }
      : isLogin
        ? {
            email: '',
            password: '',
          }
        : {
            email: '',
          },
  });

  const register = useRegester();
  const login = useLogin();
  const sendNewEmail = useSendNewVerifyEmail();

  const onSubmit = (data: AuthFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const registerData: FormData = new FormData();
    registerData.append('fullname', form.getValues('fullname'));
    registerData.append('username', form.getValues('username'));
    registerData.append('email', form.getValues('email'));
    registerData.append('password', form.getValues('password'));

    if (isRegister) {
      register.mutate(registerData);
    } else if (isLogin) {
      login.mutate(formData);
    } else if (isSendNewEmail) {
      sendNewEmail.mutate(formData);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
          <h1 className="text-2xl text-center font-medium italic">
            {isRegister ? (
              'Register fast ...'
            ) : isLogin ? (
              'Welcome Back'
            ) : (
              <p className="text-slate-300">
                Send Verification <br /> New <sup>Email</sup>
              </p>
            )}
          </h1>

          {isRegister && (
            <div className="grid grid-cols-2 gap-2">
              <FormInput
                control={form.control}
                name="fullname"
                label="Full Name"
                placeholder="Johan Doe"
                icon={User03Icon}
                disabled={register.isPending || login.isPending || sendNewEmail.isPending}
              />

              <FormInput
                control={form.control}
                name="username"
                label="Username"
                placeholder="johan_dev"
                icon={UserLock01Icon}
                disabled={register.isPending || login.isPending || sendNewEmail.isPending}
              />
            </div>
          )}

          <FormInput
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="perpx@example.com"
            icon={Mail01Icon}
            disabled={register.isPending || login.isPending || sendNewEmail.isPending}
          />

          {(isRegister || isLogin) && (
            <FormInput
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="********"
              icon={LockPasswordIcon}
              disabled={register.isPending || login.isPending || sendNewEmail.isPending}
            />
          )}

          {isRegister && (
            <FormInput
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="********"
              icon={LockPasswordIcon}
              disabled={register.isPending || login.isPending || sendNewEmail.isPending}
            />
          )}

          <Button
            disabled={register.isPending || login.isPending || sendNewEmail.isPending}
            className="w-full flex items-center justify-center gap-2"
          >
            {register.isPending || login.isPending || sendNewEmail.isPending ? (
              <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />
            ) : null}

            {isRegister ? (
              'Create Account'
            ) : isLogin ? (
              <>
                <HugeiconsIcon
                  icon={Login02Icon}
                  size={18}
                  className={`${register.isPending || login.isPending || sendNewEmail.isPending ? 'hidden' : ''}`}
                />
                Login
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={18}
                  className={`${register.isPending || login.isPending || sendNewEmail.isPending ? 'hiddne' : ''}`}
                />
                Send New Email
              </>
            )}
          </Button>

          {(isRegister || isLogin) && (
            <div className="w-full flex items-center justify-between">
              {isLogin && (
                <Link href={'/account/sendnewemail'} className="text-red-600">
                  <Button className="px-6">New Verify email</Button>
                </Link>
              )}

              <div className="text-xs flex gap-1">
                <Link
                  href={isRegister ? '/account/login' : '/account/register'}
                  className="text-red-600"
                >
                  <Button variant={'link'} className="px-6 bg-neutral-900">
                    {isRegister ? 'Login account' : 'Not hav a account'}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
