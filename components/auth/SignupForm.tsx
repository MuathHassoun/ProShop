// components/auth/SignupForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, ShieldCheck, User } from 'lucide-react';
import AuthField from './AuthField';
import { Divider, FormAlert, SubmitButton } from './AuthParts';
import { useAuthSubmit } from './useAuthSubmit';
import { isEmail, MIN_PASSWORD_LENGTH, readForm } from './validation';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>;

export default function SignupForm() {
  const [errors, setErrors] = useState<Errors>({});
  const { submit, loading, formError } = useAuthSubmit(
    '/api/auth/register',
    'Could not create account'
  );

  const clearError = (key: keyof Errors) => () =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = readForm(e.currentTarget, ['name', 'email', 'password', 'confirm']);
    const name = values.name.trim();
    const email = values.email.trim();
    const { password, confirm } = values;

    const next: Errors = {};
    if (!name) next.name = 'Please enter your name';
    if (!isEmail(email)) next.email = 'Enter a valid email address';
    if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length === 0) submit({ name, email, password });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <AuthField
        label="Name"
        name="name"
        icon={User}
        placeholder="Your name"
        autoComplete="name"
        error={errors.name}
        onChange={clearError('name')}
      />
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
        placeholder="Create a password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
        autoComplete="new-password"
        error={errors.password}
        onChange={clearError('password')}
      />
      <AuthField
        label="Confirm password"
        name="confirm"
        type="password"
        icon={ShieldCheck}
        placeholder="Repeat your password"
        autoComplete="new-password"
        error={errors.confirm}
        onChange={clearError('confirm')}
      />

      <FormAlert message={formError} />

      <div className="mt-6">
        <SubmitButton loading={loading} loadingText="Creating account…">
          Sign up
        </SubmitButton>
      </div>

      <Divider>Already registered?</Divider>

      <p className="text-center text-sm text-[#6b6b6b]">
        Have an account?{' '}
        <Link href="/login" className="font-semibold text-[#252525] hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
