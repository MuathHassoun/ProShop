// components/admin/UserForm.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckboxField, Field, FormError, inputClass, primaryButtonClass, secondaryButtonClass } from './fields';
import { sendJson } from './patch';

export interface UserFormValues {
  full_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  password: string;
}

interface Props {
  mode: 'create' | 'edit';
  userId?: number;
  isSelf?: boolean;
  initial: UserFormValues;
}

export default function UserForm({ mode, userId, isSelf = false, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const url = mode === 'create' ? '/api/admin/users' : `/api/admin/users/${userId}`;
    const body: Record<string, unknown> = { ...values };
    if (mode === 'edit' && !values.password) delete body.password;
    const { error: message } = await sendJson(mode === 'create' ? 'POST' : 'PATCH', url, body);
    setSaving(false);
    if (message) return setError(message);
    router.push('/admin/users');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <FormError message={error} />

      <Field label="Full name" htmlFor="user-name">
        <input
          id="user-name"
          required
          maxLength={150}
          value={values.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Email" htmlFor="user-email">
        <input
          id="user-email"
          type="email"
          required
          maxLength={150}
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Phone" htmlFor="user-phone">
        <input
          id="user-phone"
          maxLength={30}
          value={values.phone}
          onChange={(e) => set('phone', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field
        label={mode === 'create' ? 'Password' : 'New password'}
        htmlFor="user-password"
        hint={mode === 'edit' ? 'Leave empty to keep the current password.' : 'At least 8 characters.'}
      >
        <input
          id="user-password"
          type="password"
          autoComplete="new-password"
          required={mode === 'create'}
          minLength={8}
          maxLength={128}
          value={values.password}
          onChange={(e) => set('password', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Role" htmlFor="user-role" hint={isSelf ? 'You cannot change your own role.' : undefined}>
        <select
          id="user-role"
          value={values.role}
          disabled={isSelf}
          onChange={(e) => set('role', e.target.value as 'admin' | 'customer')}
          className={inputClass}
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
      </Field>

      <CheckboxField
        id="user-active"
        label="Account active"
        checked={values.is_active}
        disabled={isSelf}
        onChange={(v) => set('is_active', v)}
      />

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create user' : 'Save changes'}
        </button>
        <Link href="/admin/users" className={secondaryButtonClass}>
          Cancel
        </Link>
      </div>
    </form>
  );
}