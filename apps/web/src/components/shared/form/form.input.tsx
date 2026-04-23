'use client';

import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  disabled?: boolean;
  icon?: IconSvgElement;
}

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  icon,
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-medium text-neutral-200">{label}</FormLabel>

          <FormControl>
            <div className="relative mt-0.5">
              {icon && (
                <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-neutral-500">
                  <HugeiconsIcon icon={icon} size={18} color="currentColor" strokeWidth={1.8} />
                </span>
              )}

              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={`
                  h-11 w-full rounded-md
                  border border-white/10
                  bg-white/5
                  ${icon ? 'pl-10' : 'pl-3'} pr-3
                  text-sm text-white
                  placeholder:text-neutral-500
                  shadow-sm backdrop-blur-sm
                  transition-all duration-200
                  hover:border-white/20
                  focus-visible:border-teal-400
                  focus-visible:ring-2
                  focus-visible:ring-teal-500/30
                  focus-visible:ring-offset-0
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                `}
              />
            </div>
          </FormControl>

          <FormMessage className="text-xs text-red-400" name={name} />
        </FormItem>
      )}
    />
  );
}
