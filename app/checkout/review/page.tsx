import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReviewStep } from '@/components/checkout/ReviewStep';
import TopRateProducts from '@/components/common/cards/TopRateProducts';

export const metadata: Metadata = {
  title: 'Place Order | ProShop',
  robots: { index: false },
};

export default function CheckoutReviewPage() {
  return (
    <ReviewStep
      topRated={
        <Suspense fallback={null}>
          <TopRateProducts />
        </Suspense>
      }
    />
  );
}