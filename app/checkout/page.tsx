// app/checkout/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import { ShippingPaymentStep } from '@/components/checkout/ShippingPaymentStep';

export const metadata: Metadata = {
  title: 'Checkout | ProShop',
  description: 'Enter your shipping and payment details.',
};

export default function CheckoutPage() {
  return (
    <div className={`${mulish.className} min-h-[60vh] bg-white`}>
      <ShippingPaymentStep />
    </div>
  );
}