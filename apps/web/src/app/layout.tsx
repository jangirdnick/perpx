import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import StoreProvider from '../lib/providers/store.provider';
import { Toaster } from 'sonner';
import QueryProvider from '../lib/providers/query.provider';
import AuthInitializer from '../lib/authInitializer';
import AuthRedirectHandler from '../lib/authredirect';
import { ThemeProvider } from '../components/theme-provider';

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/inter/Inter-VariableFont_opsz,wght.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const sora = localFont({
  src: [
    {
      path: '../../public/fonts/sora/Sora-VariableFont_wght.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-sora',
  display: 'swap',
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
      suppressHydrationWarning
      className={cn('h-full antialiased', inter.variable, sora.variable)}
    >
      <body className="min-h-full flex flex-col font-sora">
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AuthInitializer />
              <AuthRedirectHandler />
              <main>{children}</main>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
