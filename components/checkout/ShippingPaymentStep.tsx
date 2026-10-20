// components/checkout/ShippingPaymentStep.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthField from '@/components/auth/AuthField';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { OrderItems } from '@/components/checkout/OrderItems';
import { Totals } from '@/components/checkout/Totals';
import { detectBrand, digitsOnly, formatCardNumber, luhnValid } from '@/lib/card';
import { fetchSavedSettings } from '@/lib/settings-client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCheckoutDraft } from '@/store/slices/checkoutSlice';
import { useMounted } from '@/store/useWishlist';
import type { CheckoutAddress, CheckoutDraft, CheckoutPayment } from '@/types/index';
import type { SavedPaymentMethod, SavedSettings } from '@/types';

interface Form {
  recipient_name: string;
  country: string;
  city: string;
  zip_code: string;
  street_address: string;
  name_on_card: string;
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
}
type Errors = Partial<Record<keyof Form | 'expiry', string>>;

const emptyForm: Form = {
  recipient_name: '',
  country: '',
  city: '',
  zip_code: '',
  street_address: '',
  name_on_card: '',
  card_number: '',
  exp_month: '',
  exp_year: '',
  cvc: '',
};

const inputBase =
  'block h-11 w-full rounded-xl border bg-[#fafafa] px-3.5 text-[15px] text-[#252525] outline-none transition placeholder:text-[#b0b0b0] hover:border-[#c8c8c8] focus:bg-white focus:ring-4';

function buildForm(draft: CheckoutDraft, saved: SavedSettings | null, fallbackName: string): Form {
  const a = draft.address ?? saved?.address ?? null;
  const p = draft.payment ?? saved?.payment ?? null;
  return {
    recipient_name: a?.recipient_name || fallbackName,
    country: a?.country ?? '',
    city: a?.city ?? '',
    zip_code: a?.zip_code ?? '',
    street_address: a?.street_address ?? '',
    name_on_card: draft.payment?.name_on_card || fallbackName,
    card_number: '',
    exp_month: p ? String(p.exp_month).padStart(2, '0') : '',
    exp_year: p ? String(p.exp_year).slice(-2) : '',
    cvc: '',
  };
}

function validate(f: Form, existing: SavedPaymentMethod | null): Errors {
  const e: Errors = {};
  if (!f.recipient_name.trim()) e.recipient_name = 'Enter the recipient name';
  if (!f.country.trim()) e.country = 'Enter your country';
  if (!f.city.trim()) e.city = 'Enter your city';
  if (!f.zip_code.trim()) e.zip_code = 'Enter your zip code';
  if (!f.street_address.trim()) e.street_address = 'Enter your street address';
  if (!f.name_on_card.trim()) e.name_on_card = 'Enter the name on the card';

  const digits = digitsOnly(f.card_number);
  if (digits) {
    if (digits.length < 12 || !luhnValid(digits)) e.card_number = 'Enter a valid card number';
    if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = 'Enter the 3 or 4 digit CVC';
  } else if (!existing) {
    e.card_number = 'Enter your card number';
  }

  const month = Number(f.exp_month);
  const year = 2000 + Number(f.exp_year);
  const now = new Date();
  if (!/^\d{1,2}$/.test(f.exp_month) || month < 1 || month > 12 || !/^\d{2}$/.test(f.exp_year)) {
    e.expiry = 'Enter a valid expiry date (MM / YY)';
  } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    e.expiry = 'This card has expired';
  }
  return e;
}

async function saveSetting(userId: number, section: 'address' | 'payment', data: object) {
  try {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, section, data }),
    });
  } catch {
    // Saving to settings is a convenience; never block checkout on it.
  }
}

export function ShippingPaymentStep() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mounted = useMounted();

  const user = useAppSelector((s) => s.user.userInfo);
  const items = useAppSelector((s) => s.cart.cartItems);
  const cart = useAppSelector((s) => s.cart);
  const draft = useAppSelector((s) => s.checkout);
  const draftRef = useRef(draft);

  const [form, setForm] = useState<Form>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState<SavedSettings | null>(null);
  const [existingCard, setExistingCard] = useState<SavedPaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.user_id;
  const fullName = user?.full_name ?? '';
  const userPhone = user?.phone ?? null;

  useEffect(() => {
    if (mounted && !user) router.replace('/login');
  }, [mounted, user, router]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const d = draftRef.current;

    fetchSavedSettings(userId)
      .then((settings) => {
        if (cancelled) return;
        setSaved(settings);
        setExistingCard(d.payment ?? settings.payment);
        setForm(buildForm(d, settings, fullName));
      })
      .catch(() => {
        if (cancelled) return;
        setExistingCard(d.payment);
        setForm(buildForm(d, null, fullName));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, fullName]);

  function set(name: keyof Form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, ...(name.startsWith('exp_') ? { expiry: undefined } : {}) }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || !userId) return;

    const errs = validate(form, existingCard);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const digits = digitsOnly(form.card_number);
    const card = digits
      ? { card_brand: detectBrand(digits), last_four: digits.slice(-4) }
      : { card_brand: existingCard!.card_brand, last_four: existingCard!.last_four };

    const address: CheckoutAddress = {
      recipient_name: form.recipient_name.trim(),
      phone: saved?.address?.phone ?? userPhone,
      country: form.country.trim(),
      city: form.city.trim(),
      zip_code: form.zip_code.trim(),
      street_address: form.street_address.trim(),
    };
    const payment: CheckoutPayment = {
      ...card,
      name_on_card: form.name_on_card.trim(),
      exp_month: Number(form.exp_month),
      exp_year: 2000 + Number(form.exp_year),
    };

    setSubmitting(true);
    dispatch(setCheckoutDraft({ address, payment }));

    if (saved) {
      await Promise.all([
        !saved.address &&
          saveSetting(userId, 'address', { ...address, phone: address.phone ?? '', address_details: '' }),
        !saved.payment &&
          saveSetting(userId, 'payment', {
            card_brand: payment.card_brand,
            last_four: payment.last_four,
            exp_month: payment.exp_month,
            exp_year: payment.exp_year,
          }),
      ]);
    }

    router.push('/checkout/review');
  }

  const typedDigits = digitsOnly(form.card_number);
  const cardHint = typedDigits
    ? detectBrand(typedDigits)
    : existingCard
      ? `Using your saved ${existingCard.card_brand} card ending in ${existingCard.last_four}. Enter a new number to change it.`
      : undefined;

  const panel = 'rounded-2xl bg-neutral-100 p-5 sm:p-8';
  const heading = 'mb-4 text-2xl font-bold text-[#252525]';

  return (
    <section
      aria-labelledby="checkout-heading"
      className="mx-auto max-w-[1500px] px-4 py-6 text-neutral-800 sm:px-6 sm:py-10 lg:px-8"
    >
      <h1 id="checkout-heading" className="text-2xl font-bold sm:text-3xl">
        Review Order
      </h1>
      <CheckoutSteps current={1} />

      {!mounted || !user || loading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]" aria-busy="true">
          <div className="h-[520px] animate-pulse rounded-2xl bg-neutral-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
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
      ) : (
        <>
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
            <form id="checkout-form" onSubmit={onSubmit} noValidate className={panel}>
              <h2 className={heading}>Shipping Address</h2>
              <div className="grid gap-x-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <AuthField label="Full name" autoComplete="name" value={form.recipient_name}
                    error={errors.recipient_name} onChange={(e) => set('recipient_name', e.target.value)} />
                </div>
                <AuthField label="Country" autoComplete="country-name" value={form.country}
                  error={errors.country} onChange={(e) => set('country', e.target.value)} />
                <AuthField label="City" autoComplete="address-level2" value={form.city}
                  error={errors.city} onChange={(e) => set('city', e.target.value)} />
                <AuthField label="Zip Code" autoComplete="postal-code" value={form.zip_code}
                  error={errors.zip_code} onChange={(e) => set('zip_code', e.target.value)} />
                <AuthField label="Street Address" autoComplete="street-address" value={form.street_address}
                  error={errors.street_address} onChange={(e) => set('street_address', e.target.value)} />
              </div>

              <h2 className={`${heading} mt-6`}>Payment Details</h2>
              <div className="grid gap-x-6 sm:grid-cols-2">
                <AuthField label="Name on Card" autoComplete="cc-name" value={form.name_on_card}
                  error={errors.name_on_card} onChange={(e) => set('name_on_card', e.target.value)} />
                <AuthField
                  label="Card Number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder={existingCard ? `•••• •••• •••• ${existingCard.last_four}` : '0000 0000 0000 0000'}
                  value={form.card_number}
                  error={errors.card_number}
                  hint={cardHint}
                  onChange={(e) => set('card_number', formatCardNumber(e.target.value))}
                />

                <div className="mb-4">
                  <label htmlFor="exp-month" className="mb-1.5 block text-sm font-semibold text-[#252525]">
                    Expiration Date
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="exp-month"
                      aria-label="Expiry month"
                      inputMode="numeric"
                      autoComplete="cc-exp-month"
                      placeholder="MM"
                      maxLength={2}
                      value={form.exp_month}
                      onChange={(e) => set('exp_month', digitsOnly(e.target.value))}
                      className={`${inputBase} ${errors.expiry ? 'border-red-400 focus:ring-red-100' : 'border-[#e2e2e2] focus:border-[#fdde0b] focus:ring-[#fdde0b]/30'}`}
                    />
                    <span aria-hidden="true" className="text-neutral-400">/</span>
                    <input
                      aria-label="Expiry year"
                      inputMode="numeric"
                      autoComplete="cc-exp-year"
                      placeholder="YY"
                      maxLength={2}
                      value={form.exp_year}
                      onChange={(e) => set('exp_year', digitsOnly(e.target.value))}
                      className={`${inputBase} ${errors.expiry ? 'border-red-400 focus:ring-red-100' : 'border-[#e2e2e2] focus:border-[#fdde0b] focus:ring-[#fdde0b]/30'}`}
                    />
                  </div>
                  {errors.expiry && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.expiry}
                    </p>
                  )}
                </div>

                <AuthField label="CVC" inputMode="numeric" autoComplete="cc-csc" maxLength={4}
                  placeholder="•••" value={form.cvc} error={errors.cvc}
                  hint="Used to verify your card. We never store it."
                  onChange={(e) => set('cvc', digitsOnly(e.target.value))} />
              </div>
            </form>

            <aside aria-label="Order details" className="rounded-2xl bg-neutral-100 p-5 sm:p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-2xl font-bold text-[#252525]">Order Details</h2>
                <Link href="/cart" className="text-sm text-neutral-500 underline transition hover:text-neutral-900">
                  Change
                </Link>
              </div>
              <OrderItems items={items} />
              <div className="mt-4 border-t border-neutral-300 pt-4">
                <Totals subtotal={cart.itemsPrice} tax={cart.taxPrice} shipping={cart.shippingPrice} total={cart.totalPrice} />
              </div>
            </aside>
          </div>

          <div className="mt-6 flex justify-end lg:pr-0">
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#fdde0b] px-8 text-base font-semibold text-[#252525] transition hover:bg-[#f5d200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[380px]"
            >
              {submitting ? 'Please wait...' : 'Review Order'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default ShippingPaymentStep;