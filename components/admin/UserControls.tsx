// components/admin/UserControls.tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { patchJson } from './patch';

export default function UserControls({
  userId,
  role,
  isActive,
  isSelf,
}: {
  userId: number;
  role: 'admin' | 'customer';
  isActive: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function update(body: Record<string, unknown>) {
    setError('');
    setSaving(true);
    const message = await patchJson(`/api/admin/users/${userId}`, body);
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    startTransition(() => router.refresh());
  }

  const busy = saving || isPending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`Role of user ${userId}`}
        value={role}
        disabled={busy || isSelf}
        onChange={(e) => update({ role: e.target.value })}
        className="rounded-lg border border-[#e5e5e5] bg-white px-2 py-1.5 text-sm capitalize text-[#252525] focus:border-[#252525] focus:outline-none disabled:opacity-60"
      >
        <option value="customer">customer</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="button"
        disabled={busy || isSelf}
        onClick={() => update({ is_active: !isActive })}
        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isActive
            ? 'border-red-200 text-red-600 hover:bg-red-50'
            : 'border-green-200 text-green-700 hover:bg-green-50'
        }`}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      {isSelf && <span className="text-xs text-[#888888]">You</span>}
      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
