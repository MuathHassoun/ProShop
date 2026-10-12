
import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';

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
    <html lang="en" className="dark">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
