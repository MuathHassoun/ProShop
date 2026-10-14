// app/layout.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'ProShop',
  description: 'ProShop e-commerce store',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen max-w-full mx-auto flex flex-col bg-white text-black">
        <Suspense fallback={null}>
          <StoreProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
