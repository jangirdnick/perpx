'use client';

import GuestProvider from '../../lib/providers/guest.provider';

interface AccountLayoutProps {
  children: React.ReactNode;
  sendnewemail: React.ReactNode;
}

export default function AccountLayout({ children, sendnewemail }: AccountLayoutProps) {
  return (
    <GuestProvider>
      <main className="relative">
        {children}
        {sendnewemail}
      </main>
    </GuestProvider>
  );
}
