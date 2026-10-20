// components/checkout/ReviewStep.tsx
'use client';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderItems } from '@/components/checkout/OrderItems';
import { OrderSuccess, type OrderSuccessData } from '@/components/checkout/OrderSuccess';
import { Totals } from '@/components/checkout/Totals';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { clearCheckout } from '@/store/slices/checkoutSlice';
import { useMounted } from '@/store/useWishlist';

export function ReviewStep({ topRated }: { topRated?: ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mounted = useMounted();

  const user = useAppSelector((s) => s.user.userInfo);
  const items = useAppSelector((s) => s.cart.cartItems);
  const cart = useAppSelector((s) => s.cart);
  const { address, payment } = useAppSelector((s) => s.checkout);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<OrderSuccessData | null>(null);

  useEffect(() => {
    if (!mounted || placed) return;
    if (!user) router.replace('/login');
    else if (items.length > 0 && (!address || !payment)) router.replace('/checkout');
  }, [mounted, placed, user, items.length, address, payment, router]);

  async function placeOrder() {
    if (placing || !user || !address || !payment) return;
    setPlacing(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.user_id,
          items: items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })),
          address,
          payment: {
            card_brand: payment.card_brand,
            last_four: payment.last_four,
            exp_month: payment.exp_month,
            exp_year: payment.exp_year,
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not place your order');

      setPlaced({
        id: data.orderId,
        address,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
      });
      dispatch(clearCart());
      dispatch(clearCheckout());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const sectionTitle = 'text-lg font-bold text-[#252525]';
  const changeLink = 'text-sm text-neutral-500 underline transition hover:text-neutral-900';

  if (placed) return <OrderSuccess order={placed}>{topRated}</OrderSuccess>;

  const ready = mounted && !!user && items.length > 0 && !!address && !!payment;

  return (
    <section
      aria-labelledby="review-heading"
      className="mx-auto max-w-[1500px] px-4 py-6 text-neutral-800 sm:px-6 sm:py-10 lg:px-8"
    >
      <h1 id="review-heading" className="text-2xl font-bold sm:text-3xl">
        Review Order
      </h1>
      <CheckoutSteps current={2} />

      {!mounted ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]" aria-busy="true">
          <div className="h-[480px] animate-pulse rounded-2xl bg-neutral-100" />
          <div className="h-60 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-neutral-100 px-6 py-16 text-center">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <Link
            href="/products"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-[#fdde0b] px-6 text-sm font-semibold text-[#252525] transition hover:bg-[#f5d200]"
          >
            Browse products
          </Link>
        </div>
      ) : !ready ? (
        <div className="mt-6 h-[480px] animate-pulse rounded-2xl bg-neutral-100" aria-busy="true" />
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8 rounded-2xl bg-neutral-100 p-5 sm:p-8">
            <div>
              <h2 className={sectionTitle}>Shipping Address</h2>
              <p className="mt-2 text-lg text-[#252525]">{address!.recipient_name}</p>
              <p className="mt-1 text-sm leading-6 text-neutral-600">
                {address!.street_address}, {address!.city},
                <br />
                {address!.country} - {address!.zip_code}
              </p>
              {address!.phone && <p className="text-sm text-neutral-600">{address!.phone}</p>}
            </div>

            <div>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className={sectionTitle}>Order Details</h2>
                <Link href="/cart" className={changeLink}>Change</Link>
              </div>
              <OrderItems items={items} />
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className={sectionTitle}>Payment Details</h2>
                <Link href="/checkout" className={changeLink}>Change</Link>
              </div>
              <p className="text-sm text-neutral-700">
                <span className="font-bold text-sky-700">{payment!.card_brand}</span>{' '}
                •••• {payment!.last_four}
                <span className="ml-3 text-neutral-500">
                  Exp {String(payment!.exp_month).padStart(2, '0')}/{String(payment!.exp_year).slice(-2)}
                </span>
              </p>
            </div>
          </div>

          <aside aria-label="Order total" className="space-y-4">
            <div className="rounded-2xl bg-neutral-100 p-5 sm:p-6">
              <h2 className="mb-4 text-2xl font-bold text-[#252525]">Order Details</h2>
              <Totals subtotal={cart.itemsPrice} tax={cart.taxPrice} shipping={cart.shippingPrice} total={cart.totalPrice} />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {error}{' '}
                <Link href="/cart" className="underline">Review cart</Link>
              </p>
            )}

            <button
              type="button"
              onClick={placeOrder}
              disabled={placing}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#fdde0b] px-6 text-base font-semibold text-[#252525] transition hover:bg-[#f5d200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default ReviewStep;