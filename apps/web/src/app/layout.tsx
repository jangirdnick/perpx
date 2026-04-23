import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter, Sora } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import StoreProvider from '../lib/providers/store.provider';
import { Toaster } from 'sonner';
import QueryProvider from '../lib/providers/query.provider';
import AuthInitializer from '../lib/authInitializer';
import AuthRedirectHandler from '../lib/authredirect';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'perpx',
  description:
    'PERPX ek AI chat application hai jo research aur chat ke liye design kiya gaya hai. Yahan aap private aur group/team spaces bana sakte hain jahan AI ke saath ideas discuss kar sakte hain aur apne thoughts ko research kar sakte hain.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        sora.variable,
        'font-sans',
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col dark">
        <StoreProvider>
          <QueryProvider>
            <AuthInitializer />
            <AuthRedirectHandler />
            <main>{children}</main>
            <Toaster />
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
