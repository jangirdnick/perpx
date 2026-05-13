'use client';

import React from 'react';
import GuestProvider from '../../lib/providers/guest.provider';

interface AccountLayoutProps {
  children: React.ReactNode;
  sendnewemail: React.ReactNode;
}

export default function AccountLayout({ children, sendnewemail }: AccountLayoutProps) {
  return (
    <GuestProvider>
      <main className="relative dark:bg-black">
        {children}
        {sendnewemail}
      </main>
    </GuestProvider>
  );
}
