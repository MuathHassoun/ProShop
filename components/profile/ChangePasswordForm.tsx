// components/profile/ChangePasswordForm.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, KeyRound, LockKeyhole } from 'lucide-react';
import AuthField from '@/components/auth/AuthField';
import { MIN_PASSWORD_LENGTH, readForm } from '@/components/auth/validation';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/store/useWishlist';

const FIELDS = ['currentPassword', 'newPassword', 'confirmPassword'] as const;
type Errors = Partial<Record<(typeof FIELDS)[number], string>>;

export default function ChangePasswordForm() {
  const router = useRouter();
  const mounted = useMounted();
  const user = useAppSelector((s) => s.user.userInfo);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mounted && !user) router.replace('/login');
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10" role="status" aria-busy="true" aria-label="Loading">
        <div className="h-72 animate-pulse rounded-2xl bg-[#f1f1f1]" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    const form = e.currentTarget;
    const { currentPassword, newPassword, confirmPassword } = readForm(form, FIELDS);

    const next: Errors = {};
    if (!currentPassword) next.currentPassword = 'Enter your current password';
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      next.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    } else if (newPassword === currentPassword) {
      next.newPassword = 'Choose a password different from the current one';
    }
    if (confirmPassword !== newPassword) next.confirmPassword = 'Passwords do not match';

    setErrors(next);
    setFormError(null);
    setSuccess(false);
    if (Object.keys(next).length > 0) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.user_id, currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ currentPassword: data.error || 'Current password is incorrect' });
        } else {
          setFormError(data.error || 'Could not change password');
        }
        return;
      }

      form.reset();
      setSuccess(true);
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href="/profile"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#777777] transition-colors hover:text-[#252525]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to profile
      </Link>

      <section
        aria-labelledby="change-password-heading"
        className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="mb-6 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f2f2] text-[#252525]">
            <LockKeyhole size={20} aria-hidden="true" />
          </div>
          <div>
            <h1 id="change-password-heading" className="text-xl font-bold text-[#252525]">
              Change password
            </h1>
            <p className="mt-1 text-sm text-[#777777]">
              Enter your current password, then choose a new one.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            label="Current password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            icon={KeyRound}
            error={errors.currentPassword}
          />
          <AuthField
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            icon={LockKeyhole}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
            error={errors.newPassword}
          />
          <AuthField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            icon={LockKeyhole}
            error={errors.confirmPassword}
          />

          {formError && (
            <p role="alert" className="mb-4 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"
            >
              <Check size={16} aria-hidden="true" />
              Your password has been updated.
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#fdde0b] px-4 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>
    </div>
  );
}
