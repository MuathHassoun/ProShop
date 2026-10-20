// components/checkout/OrderSuccess.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface OrderSuccessData {
  id: number;
  address: {
    recipient_name: string;
    street_address: string;
    city: string;
    country: string;
    zip_code: string;
  };
  items: { name: string; quantity: number }[];
}

const row = 'grid gap-1 sm:grid-cols-[1fr_2fr] sm:gap-x-6 sm:items-baseline';
const label = 'text-lg font-semibold text-[#252525]';
const value = 'text-sm font-medium text-neutral-600';

export function OrderSuccess({ order, children }: { order: OrderSuccessData; children?: ReactNode }) {
  const { id, address, items } = order;

  return (
    <section
      aria-labelledby="order-success-heading"
      className="mx-auto max-w-[1500px] px-4 py-10 text-neutral-800 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl bg-neutral-100 p-6 sm:p-8">
        <h1 id="order-success-heading" className="text-2xl font-bold text-[#252525]">
          Payment Success!
        </h1>

        <dl className="mt-6 space-y-5">
          <div className={row}>
            <dt className={label}>Order number</dt>
            <dd className={value}>#{id}</dd>
          </div>

          <div className={row}>
            <dt className={label}>Shipping Address</dt>
            <dd className={value}>
              {address.street_address}, {address.city}, {address.country} - {address.zip_code}
            </dd>
          </div>

          <div className={row}>
            <dt className={label}>Order Items</dt>
            <dd className={value}>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}x {item.name}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <p className="mt-6 max-w-xs text-xs leading-5 text-neutral-600">
          An email will be sent to your email address that contains order confirmation and tracking
          code.
        </p>

        <div className="mt-8 flex justify-end">
            <Link href="/" className="inline-flex h-11 items-center rounded-lg bg-[#fdde0b] px-6 text-sm font-semibold text-[#252525] transition hover:bg-[#f5d200]">
                Continue shopping
            </Link>
        </div>
      </div>

      {children}
    </section>
  );
}

export default OrderSuccess;