// app/cart/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { mulish } from '@/lib/fonts';
import { ShoppingCart } from '@/components/cart/ShoppingCart';
import TopRateProducts from '@/components/common/cards/TopRateProducts';

export const metadata: Metadata = {
  title: 'Shopping Cart | ProShop',
  description: 'Review the items in your cart.',
};

export default function CartPage() {
  return (
    <div className={`${mulish.className} min-h-[60vh] bg-white`}>
      <ShoppingCart>
        <Suspense fallback={null}>
          <TopRateProducts />
        </Suspense>
      </ShoppingCart>
    </div>
  );
}
