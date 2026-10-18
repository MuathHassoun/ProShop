// app/login/page.tsx
import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import RedirectAuthenticated from '@/components/auth/RedirectAuthenticated';
import LoginForm from '@/components/auth/LoginForm';
import LoginIllustration from '@/components/auth/LoginIllustration';

export const metadata: Metadata = { title: 'Login | ProShop' };

export default function LoginPage() {
  return (
    <>
      <RedirectAuthenticated />
      <AuthShell
        title="Login."
        subtitle="Login with your data that you entered during registration"
        illustration={<LoginIllustration />}
        subtitleWidth="max-w-[310px]"
      >
        <LoginForm />
      </AuthShell>
    </>
  );
}
