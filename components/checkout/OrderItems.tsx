// components/checkout/OrderItems.tsx
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import type { CartItem } from '@/types';

export function OrderItems({ items }: { items: CartItem[] }) {
  return (
    <ul className="divide-y divide-neutral-300">
      {items.map((item) => (
        <li key={item.variant_id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-white">
            {item.image_url && (
              <Image
                src={item.image_url}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1 mix-blend-multiply"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
            <p className="line-clamp-2 text-sm text-neutral-600">
              {item.name}
              {item.variant_name ? ` · ${item.variant_name}` : ''}
            </p>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-neutral-500">
                {formatPrice(item.price)} <span className="text-xs">×{item.quantity}</span>
              </span>
              <span className="font-semibold tabular-nums text-neutral-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}