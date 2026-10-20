// components/profile/OrdersHistory.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/store/useWishlist';
import { formatBadgeCount, formatDate, formatPrice } from '@/lib/format';
import type { Order } from '@/types';

type Status = 'loading' | 'ready' | 'error';

const STATUS_STYLES: Record<Order['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-sky-50 text-sky-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
};

function formatAddress(snapshot: Order['shipping_address_snapshot']) {
  if (!snapshot) return null;
  const read = (key: string) => (typeof snapshot[key] === 'string' ? (snapshot[key] as string) : '');
  const line = [read('street_address'), read('city'), read('country')].filter(Boolean).join(', ');
  if (!line) return null;
  return read('zip_code') ? `${line} - ${read('zip_code')}` : line;
}

const emptyBox =
  'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e5e5e5] bg-white px-6 py-16 text-center';
const primaryLink =
  'mt-2 inline-flex min-h-10 items-center rounded-lg bg-[#fdde0b] px-4 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200]';

export function OrdersHistory() {
  const mounted = useMounted();
  const user = useAppSelector((s) => s.user.userInfo);
  const userId = user?.user_id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetch(`/api/orders?userId=${userId}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Could not load your orders');
        return (data.orders ?? []) as Order[];
      })
      .then((list) => {
        if (cancelled) return;
        setOrders(list);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loading = !mounted || (!!user && status === 'loading');
  const list = loading ? [] : orders;

  return (
    <section
      aria-labelledby="orders-heading"
      className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8"
    >
      <header className="mb-6 border-b border-[#eeeeee] pb-6">
        <p className="text-sm font-medium text-[#777777]">
          <Link href="/profile" className="transition-colors hover:text-[#252525]">
            Account
          </Link>
          {' / '}
          <span aria-current="page">My Orders</span>
        </p>

        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff8cc] text-[#252525]">
            <Package size={22} aria-hidden="true" />
          </span>

          <h1 id="orders-heading" className="text-2xl font-bold tracking-tight text-[#252525] sm:text-3xl">
            My Orders
          </h1>

          {!loading && user && list.length > 0 && (
            <span
              className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fdde0b] px-2 text-sm font-bold text-[#252525]"
              aria-label={`${list.length} ${list.length === 1 ? 'order' : 'orders'}`}
            >
              {formatBadgeCount(list.length)}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-6 text-[#777777]">
          {loading
            ? 'Loading your orders…'
            : !user
              ? 'Sign in to see your order history.'
              : list.length === 0
                ? 'Orders you place will show up here.'
                : 'Track and review everything you have ordered.'}
        </p>
      </header>

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#f1f1f1]" />
          ))}
        </div>
      ) : !user ? (
        <div className={emptyBox}>
          <Package size={32} aria-hidden="true" className="text-[#bbbbbb]" />
          <p className="font-semibold text-[#252525]">Sign in to see your orders</p>
          <p className="max-w-sm text-sm text-[#777777]">Your order history is kept on your account.</p>
          <Link href="/login" className={primaryLink}>
            Sign in
          </Link>
        </div>
      ) : status === 'error' ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-600"
        >
          Could not load your orders. Please refresh the page.
        </p>
      ) : list.length === 0 ? (
        <div className={emptyBox}>
          <Package size={32} aria-hidden="true" className="text-[#bbbbbb]" />
          <p className="font-semibold text-[#252525]">You have no orders yet</p>
          <p className="max-w-sm text-sm text-[#777777]">When you place an order, it will appear here.</p>
          <Link href="/products" className={primaryLink}>
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((order) => {
            const address = formatAddress(order.shipping_address_snapshot);
            return (
              <li key={order.order_id}>
                <article className="rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eeeeee] pb-4">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-[#252525]">Order #{order.order_id}</h2>
                      <p className="mt-1 text-sm text-[#777777]">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status] ?? 'bg-neutral-100 text-neutral-600'}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-base font-bold tabular-nums text-[#252525]">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <ul className="divide-y divide-[#f1f1f1] py-2">
                    {(order.items ?? []).map((item) => (
                      <li
                        key={item.order_item_id}
                        className="flex items-baseline justify-between gap-4 py-2 text-sm"
                      >
                        <span className="min-w-0 text-neutral-700">
                          <span className="font-semibold text-[#252525]">{item.quantity}×</span>{' '}
                          {item.product_name}
                          {item.variant_name ? ` · ${item.variant_name}` : ''}
                        </span>
                        <span className="shrink-0 tabular-nums text-neutral-500">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {address && (
                    <p className="border-t border-[#eeeeee] pt-4 text-sm text-[#777777]">
                      <span className="font-semibold text-[#555555]">Ship to:</span> {address}
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default OrdersHistory;