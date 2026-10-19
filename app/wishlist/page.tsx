// app/wishlist/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import { Wishlist } from '@/components/profile/Wishlist';

export const metadata: Metadata = {
  title: 'Wishlist | ProShop',
  description: 'Products you have saved for later.',
};

export default function WishlistPage() {
  return (
    <main className={`${mulish.className} min-h-[60vh] bg-[#fafafa]`}>
      <Wishlist />
    </main>
  );
}
