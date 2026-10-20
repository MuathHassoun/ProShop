// components/cart/ShoppingCart.tsx
'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart as CartIcon } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useMounted } from '@/store/useWishlist';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { formatPrice } from '@/lib/format';

export function ShoppingCart({ children }: { children?: ReactNode }) {
  const router = useRouter();
  const mounted = useMounted();
  const items = useAppSelector((s) => s.cart.cartItems);
  const itemsPrice = useAppSelector((s) => s.cart.itemsPrice);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const originalTotal = items.reduce(
    (sum, i) =>
      sum + (i.original_price != null && i.original_price > i.price ? i.original_price : i.price) * i.quantity,
    0
  );
  const savings = originalTotal - itemsPrice;
  const hasSavings = savings > 0.005;

  return (
    <section
      aria-labelledby="cart-heading"
      className="mx-auto max-w-[1500px] px-4 py-6 text-neutral-800 sm:px-6 sm:py-10 lg:px-8"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-neutral-100 transition hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 id="cart-heading" className="text-2xl font-bold sm:text-3xl">
          Shopping Cart
        </h1>
        {mounted && count > 0 && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-neutral-600">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {!mounted ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]" aria-busy="true">
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      ) : items.length === 0 ? (
        <>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-100">
              <CartIcon className="size-8 text-neutral-400" aria-hidden="true" />
            </div>
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="max-w-sm text-sm text-neutral-500">
              Add something you like and it will show up here.
            </p>
            <Link
              href="/products"
              className="mt-3 inline-flex h-11 items-center rounded-lg bg-yellow-400 px-6 text-sm font-semibold text-neutral-900 transition hover:bg-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              Browse products
            </Link>
          </div>
          {children}
        </>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-4">
            {items.map((item) => (
              <CartItemCard key={item.variant_id} item={item} />
            ))}
          </ul>

          <aside
            aria-label="Order summary"
            className="overflow-hidden rounded-2xl bg-white shadow-sm lg:sticky lg:top-6"
          >
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-bold">Order summary</h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-500">
                    Items ({count})
                  </dt>
                  <dd className="font-medium tabular-nums">{formatPrice(originalTotal)}</dd>
                </div>
                {hasSavings && (
                  <div className="flex items-center justify-between">
                    <dt className="text-neutral-500">Discount</dt>
                    <dd className="font-medium tabular-nums text-red-500">
                      -{formatPrice(savings)}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-neutral-100 pt-4">
                <span className="font-semibold">Subtotal</span>
                <span className="text-2xl font-bold tabular-nums">{formatPrice(itemsPrice)}</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 sm:p-5">
              <Link
                href="/checkout"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-yellow-400 px-4 text-sm font-semibold text-neutral-900 transition hover:bg-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:h-12 sm:text-base"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="mt-2 flex h-10 w-full items-center justify-center rounded-lg text-sm text-neutral-600 transition hover:text-neutral-900"
              >
                Continue shopping
              </Link>
              <button
                className="mt-2 flex h-10 w-full items-center justify-center rounded-lg text-sm text-neutral-600 transition hover:text-neutral-900"
              >
                Delete All
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default ShoppingCart;