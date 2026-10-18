// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import AuthField from './AuthField';
import { Divider, FormAlert, SubmitButton } from './AuthParts';
import { useAuthSubmit } from './useAuthSubmit';
import { isEmail, readForm } from './validation';

type Errors = Partial<Record<'email' | 'password', string>>;

export default function LoginForm() {
  const [errors, setErrors] = useState<Errors>({});
  const { submit, loading, formError } = useAuthSubmit('/api/auth/login', 'Could not sign in');

  const clearError = (key: keyof Errors) => () =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = readForm(e.currentTarget, ['email', 'password']);

    const next: Errors = {};
    if (!isEmail(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Please enter your password';
    setErrors(next);
    if (Object.keys(next).length === 0) submit({ email: email.trim(), password });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <AuthField
        label="Email address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="name@example.com"
        autoComplete="email"
        error={errors.email}
        onChange={clearError('email')}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        icon={Lock}
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password}
        onChange={clearError('password')}
        labelAction={
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[#6b6b6b] transition hover:text-[#252525] hover:underline"
          >
            Forgot password?
          </Link>
        }
      />

      <label className="mb-5 flex w-fit cursor-pointer items-center gap-2 text-sm text-[#6b6b6b]">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="size-4 cursor-pointer rounded accent-[#252525]"
        />
        Remember me
      </label>

      <FormAlert message={formError} />

      <SubmitButton loading={loading} loadingText="Signing in…">
        Login
      </SubmitButton>

      <Divider>New to ProShop?</Divider>

      <Link
        href="/signup"
        className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-[#fdde0b] text-[15px] font-semibold text-[#252525] transition hover:bg-[#fdde0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]"
      >
        Create an account
      </Link>
    </form>
  );
}
