// app/signup/page.tsx
import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import RedirectAuthenticated from '@/components/auth/RedirectAuthenticated';
import SignupForm from '@/components/auth/SignupForm';
import SignupIllustration from '@/components/auth/SignupIllustration';

export const metadata: Metadata = { title: 'Sign up | ProShop' };

export default function SignupPage() {
  return (
    <>
      <RedirectAuthenticated />
      <AuthShell
        title="Signup."
        subtitle="Sign up and get exclusive offers from us"
        illustration={<SignupIllustration />}
        subtitleWidth="max-w-[270px]"
      >
        <SignupForm />
      </AuthShell>
    </>
  );
}
