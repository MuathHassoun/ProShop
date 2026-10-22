// components/admin/VariantRow.tsx
'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { patchJson } from './patch';

export interface VariantRowData {
  variant_id: number;
  product_id: number;
  product_name: string;
  variant_name: string | null;
  sku: string | null;
  category_name: string;
  product_active: boolean;
  variant_active: boolean;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
}

const inputClass =
  'w-24 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-2 py-1.5 text-sm text-[#252525] focus:border-[#252525] focus:bg-white focus:outline-none';

function Toggle({
  on,
  label,
  disabled,
  onClick,
}: {
  on: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-60 ${
        on ? 'bg-[#fdde0b]' : 'bg-[#d4d4d4]'
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default function VariantRow({ item }: { item: VariantRowData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [price, setPrice] = useState(String(item.price));
  const [discount, setDiscount] = useState(item.discount_price === null ? '' : String(item.discount_price));
  const [stock, setStock] = useState(String(item.stock_quantity));

  const dirty =
    price !== String(item.price) ||
    discount !== (item.discount_price === null ? '' : String(item.discount_price)) ||
    stock !== String(item.stock_quantity);

  async function send(body: Record<string, unknown>) {
    setError('');
    setSaving(true);
    const message = await patchJson(`/api/admin/variants/${item.variant_id}`, body);
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    startTransition(() => router.refresh());
  }

  const busy = saving || isPending;
  const name = `${item.product_name}${item.variant_name ? ` – ${item.variant_name}` : ''}`;

  return (
    <tr className="border-b border-[#eeeeee] align-top last:border-b-0">
      <td className="min-w-[220px] px-3 py-3">
        <Link
          href={`/admin/products/${item.product_id}`}
          className="font-semibold text-[#252525] underline-offset-2 hover:underline"
        >
          {item.product_name}
        </Link>
        <p className="text-xs text-[#777777]">
          {[item.variant_name, item.sku, item.category_name].filter(Boolean).join(' · ')}
        </p>
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min="0"
          step="0.01"
          aria-label={`Price of ${name}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="None"
          aria-label={`Discount price of ${name}`}
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min="0"
          step="1"
          aria-label={`Stock of ${name}`}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className={`${inputClass} w-20`}
        />
      </td>
      <td className="px-3 py-3">
        <Toggle
          on={item.variant_active}
          label={`Variant active: ${name}`}
          disabled={busy}
          onClick={() => send({ is_active: !item.variant_active })}
        />
      </td>
      <td className="px-3 py-3">
        <Toggle
          on={item.product_active}
          label={`Product visible in store: ${item.product_name}`}
          disabled={busy}
          onClick={() => send({ product_active: !item.product_active })}
        />
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={() =>
            send({
              price: Number(price),
              discount_price: discount.trim() === '' ? null : Number(discount),
              stock_quantity: Number(stock),
            })
          }
          className="cursor-pointer rounded-lg bg-[#fdde0b] px-3 py-1.5 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {error && (
          <p role="alert" className="mt-1 max-w-[180px] text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}
