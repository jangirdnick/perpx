'use client';

import {
  Controller,
  FormProvider,
  useFormContext,
  Control,
  FieldPath,
  FieldValues,
  ControllerRenderProps,
  ControllerFieldState,
  UseFormStateReturn,
} from 'react-hook-form';
import { cn } from '../../lib/utils';
export const Form = FormProvider;

export function FormField<T extends FieldValues = FieldValues>({
  control,
  name,
  render,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<T, FieldPath<T>>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<T>;
  }) => React.ReactElement;
}) {
  return <Controller control={control} name={name} render={render} />;
}

export function FormItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function FormLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={cn('text-sm text-slate-400', className)}>{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormMessage<T extends FieldValues = FieldValues>({
  name,
  className,
}: {
  name: FieldPath<T>;
  className?: string;
}) {
  const {
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];

  if (!error) return null;

  return <p className={cn('text-xs text-red-500', className)}>{error.message as string}</p>;
}
