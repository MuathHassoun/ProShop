// app/settings/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import SettingsView from '@/components/settings/SettingsView';

export const metadata: Metadata = {
  title: 'Settings | ProShop',
  description: 'Manage your saved shipping address and payment details.',
};

export default function SettingsPage() {
  return (
    <main className={mulish.className}>
      <SettingsView />
    </main>
  );
}
