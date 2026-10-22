// components/admin/OrderControls.tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { patchJson } from './patch';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'];

const selectClass =
  'rounded-lg border border-[#e5e5e5] bg-white px-2 py-1.5 text-sm capitalize text-[#252525] focus:border-[#252525] focus:outline-none disabled:opacity-60';

export default function OrderControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: number;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function update(field: 'status' | 'payment_status', value: string) {
    setError('');
    setSaving(true);
    const message = await patchJson(`/api/admin/orders/${orderId}`, { [field]: value });
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
        aria-label={`Status of order ${orderId}`}
        className={selectClass}
        value={status}
        disabled={busy}
        onChange={(e) => update('status', e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        aria-label={`Payment status of order ${orderId}`}
        className={selectClass}
        value={paymentStatus}
        disabled={busy}
        onChange={(e) => update('payment_status', e.target.value)}
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
