// app/orders/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import { OrdersHistory } from '@/components/profile/OrdersHistory';

export const metadata: Metadata = {
  title: 'My Orders History | ProShop',
  description: 'Discover your shopping history.',
};

export default function MyOrdersPage() {
  return (
    <div className={`${mulish.className} min-h-[60vh] bg-white`}>
        <OrdersHistory />
    </div>
  );
}