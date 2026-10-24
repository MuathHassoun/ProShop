// app/notifications/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import { NotificationsView } from '@/components/notifications/NotificationsView';

export const metadata: Metadata = {
  title: 'Notifications | ProShop',
  description: 'Your order updates and wishlist alerts.',
};

export default function NotificationsPage() {
  return (
    <div className={`${mulish.className} min-h-[60vh] bg-white`}>
      <NotificationsView />
    </div>
  );
}