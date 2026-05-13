'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '../../../../modules/auth/components/auth.form';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02FreeIcons } from '@hugeicons/core-free-icons';
import { Button } from '../../../../components/ui/button';

export default function SendNewEmailModal() {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="mx-auto mt-24 max-w-md w-full rounded-md bg-linear-to-tr from-black/50 to-teal-800/50 backdrop-blur-md p-4 text-black border border-teal-200/5 shadow-inner shadow-teal-600/20">
        <Button
          onClick={() => router.back()}
          variant={'outline'}
          className="bg-teal-800/40! hover:bg-teal-800/80! ease-in-out duration-200"
        >
          <HugeiconsIcon icon={ArrowLeft02FreeIcons} size={18} color="#fff"></HugeiconsIcon>
        </Button>
        <AuthForm type="SendNewEmail" />
      </div>
    </div>
  );
}
