// app/profile/password/page.tsx
import type { Metadata } from 'next';
import { mulish } from '@/lib/fonts';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Change Password | ProShop',
  description: 'Update the password for your ProShop account.',
};

export default function ChangePasswordPage() {
  return (
    <main className={`${mulish.className} min-h-[60vh] bg-[#fafafa]`}>
      <ChangePasswordForm />
    </main>
  );
}
