// components/admin/DeleteButton.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendJson } from './patch';

interface Props {
  url: string;
  label: string;
  confirmText: string;
  redirectTo: string;
  disabled?: boolean;
  disabledReason?: string;
}

export default function DeleteButton({ url, label, confirmText, redirectTo, disabled, disabledReason }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onDelete() {
    if (!window.confirm(confirmText)) return;
    setError('');
    setBusy(true);
    const { error: message } = await sendJson('DELETE', url);
    if (message) {
      setBusy(false);
      setError(message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy || disabled}
        className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Deleting...' : label}
      </button>
      {disabled && disabledReason && <p className="mt-2 text-xs text-[#888888]">{disabledReason}</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}