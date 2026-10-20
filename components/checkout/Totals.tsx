// components/checkout/Totals.tsx
import { formatPrice } from '@/lib/format';

interface Props {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export function Totals({ subtotal, tax, shipping, total }: Props) {
  const row = 'flex items-center justify-between text-sm text-neutral-500';
  return (
    <dl className="space-y-2.5">
      <div className={row}>
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      <div className={row}>
        <dt>Tax</dt>
        <dd className="tabular-nums">{formatPrice(tax)}</dd>
      </div>
      <div className={row}>
        <dt>Shipping</dt>
        <dd className="tabular-nums">{formatPrice(shipping)}</dd>
      </div>
      <div className="flex items-center justify-between pt-1 text-sm font-bold text-neutral-900">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}