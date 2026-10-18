// app/profile/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import ProfileView from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'My Profile | ProShop',
  description: 'Manage your ProShop account and profile information.',
};

export default function ProfilePage() {
  return (
    <main className={mulish.className}>
      <ProfileView />
    </main>
  );
}