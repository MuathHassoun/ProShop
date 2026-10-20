// app/wishlist/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import { Wishlist } from '@/components/profile/Wishlist';
import TopRateProducts from '@/components/common/cards/TopRateProducts';

export const metadata: Metadata = {
  title: 'Wishlist | ProShop',
  description: 'Products you have saved for later.',
};

export default function WishlistPage() {
  return (
    <main className={`${mulish.className} min-h-[60vh] bg-[#fafafa]`}>
      <Wishlist>
        <Suspense fallback={null}>
          <TopRateProducts />
        </Suspense>
      </Wishlist>
    </main>
  );
}
