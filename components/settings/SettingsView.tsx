// components/settings/SettingsView.tsx
'use client';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  CreditCard,
  Globe,
  Hash,
  Home,
  MapPin,
  Phone,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import AuthField from '@/components/auth/AuthField';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { useAvatar } from '@/components/profile/useAvatar';
import { fetchSavedSettings } from '@/lib/settings-client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/userSlice';
import { useMounted } from '@/store/useWishlist';
import type { SavedPaymentMethod, SavedShippingAddress, AddressForm, PaymentForm } from '@/types';

const panelClass = 'rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-sm sm:p-7';
const primaryButton =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#fdde0b] px-5 py-2 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525] disabled:cursor-not-allowed disabled:opacity-60';

const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Other'] as const;
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

type Status = { saving: boolean; error: string | null; saved: boolean };
const idle: Status = { saving: false, error: null, saved: false };
const emptyPayment: PaymentForm = { card_brand: '', last_four: '', exp_month: '', exp_year: '' };

function toAddressForm(
  saved: SavedShippingAddress | null,
  fallbackName: string,
  fallbackPhone: string
): AddressForm {
  return {
    recipient_name: saved?.recipient_name ?? fallbackName,
    phone: saved?.phone ?? fallbackPhone,
    country: saved?.country ?? '',
    city: saved?.city ?? '',
    zip_code: saved?.zip_code ?? '',
    street_address: saved?.street_address ?? '',
    address_details: saved?.address_details ?? '',
  };
}

function toPaymentForm(saved: SavedPaymentMethod | null): PaymentForm {
  if (!saved) return emptyPayment;
  return {
    card_brand: saved.card_brand,
    last_four: saved.last_four,
    exp_month: String(saved.exp_month).padStart(2, '0'),
    exp_year: String(saved.exp_year),
  };
}

function SectionHeader({
  icon: Icon,
  id,
  title,
  description,
  tone = 'yellow',
}: {
  icon: LucideIcon;
  id: string;
  title: string;
  description: string;
  tone?: 'yellow' | 'grey';
}) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-[#eeeeee] pb-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[#252525] ${
          tone === 'yellow' ? 'bg-[#fff8cc]' : 'bg-[#f2f2f2]'
        }`}
      >
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <h2 id={id} className="text-lg font-bold text-[#252525]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[#777777]">{description}</p>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#252525]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="block h-11 w-full cursor-pointer rounded-xl border border-[#e2e2e2] bg-[#fafafa] px-3 text-[15px] text-[#252525] outline-none transition hover:border-[#c8c8c8] focus:border-[#fdde0b] focus:bg-white focus:ring-4 focus:ring-[#fdde0b]/30"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormFooter({
  status,
  hasSaved,
  onRemove,
  savedMessage,
}: {
  status: Status;
  hasSaved: boolean;
  onRemove: () => void;
  savedMessage: string;
}) {
  return (
    <div className="mt-2">
      {status.error && (
        <p role="alert" className="mb-3 text-sm font-medium text-red-600">
          {status.error}
        </p>
      )}
      {status.saved && (
        <p
          role="status"
          className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700"
        >
          <Check size={16} aria-hidden="true" />
          {savedMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={status.saving} className={primaryButton}>
          {status.saving ? 'Saving...' : 'Save changes'}
        </button>

        {hasSaved && (
          <button
            type="button"
            onClick={onRemove}
            disabled={status.saving}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60"
          >
            <Trash2 size={16} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div
      className="mx-auto grid min-h-[420px] max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8"
      aria-label="Loading your settings"
      aria-busy="true"
      role="status"
    >
      <div className="h-56 animate-pulse rounded-2xl bg-[#f1f1f1]" />
      <div className="space-y-6">
        <div className="h-96 animate-pulse rounded-2xl bg-[#f1f1f1]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#f1f1f1]" />
      </div>
    </div>
  );
}

export default function SettingsView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mounted = useMounted();
  const user = useAppSelector((state) => state.user.userInfo);
  const avatar = useAvatar(user?.user_id, user?.avatar_url);

  const userId = user?.user_id;
  const fullName = user?.full_name ?? '';
  const userPhone = user?.phone ?? '';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedAddress, setSavedAddress] = useState<SavedShippingAddress | null>(null);
  const [savedPayment, setSavedPayment] = useState<SavedPaymentMethod | null>(null);
  const [address, setAddress] = useState<AddressForm>(() => toAddressForm(null, '', ''));
  const [payment, setPayment] = useState<PaymentForm>(emptyPayment);
  const [addressStatus, setAddressStatus] = useState<Status>(idle);
  const [paymentStatus, setPaymentStatus] = useState<Status>(idle);

  useEffect(() => {
    if (mounted && !user) router.replace('/login');
  }, [mounted, user, router]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchSavedSettings(userId)
      .then((settings) => {
        if (cancelled) return;
        setSavedAddress(settings.address);
        setSavedPayment(settings.payment);
        setAddress(toAddressForm(settings.address, fullName, userPhone));
        setPayment(toPaymentForm(settings.payment));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Could not load your settings');
        setAddress(toAddressForm(null, fullName, userPhone));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, fullName, userPhone]);

  if (!mounted || !user) return <SettingsSkeleton />;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => String(currentYear + i));

  function handleLogout() {
    dispatch(logout());
    router.replace('/login');
  }

  function setAddressField(name: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [name]: value }));
    setAddressStatus(idle);
  }

  function setPaymentField(name: keyof PaymentForm, value: string) {
    setPayment((prev) => ({ ...prev, [name]: value }));
    setPaymentStatus(idle);
  }

  async function save(section: 'address' | 'payment', data: AddressForm | PaymentForm) {
    const setStatus = section === 'address' ? setAddressStatus : setPaymentStatus;
    setStatus({ saving: true, error: null, saved: false });

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.user_id, section, data }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not save your changes');

      if (section === 'address') {
        setSavedAddress(result.address);
        setAddress(toAddressForm(result.address, '', ''));
      } else {
        setSavedPayment(result.payment);
        setPayment(toPaymentForm(result.payment));
      }
      setStatus({ saving: false, error: null, saved: true });
    } catch (err) {
      setStatus({
        saving: false,
        error: err instanceof Error ? err.message : 'Network error. Please try again.',
        saved: false,
      });
    }
  }

  async function remove(section: 'address' | 'payment') {
    const setStatus = section === 'address' ? setAddressStatus : setPaymentStatus;
    setStatus({ saving: true, error: null, saved: false });

    try {
      const response = await fetch(`/api/settings?userId=${user?.user_id}&section=${section}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not remove this item');

      if (section === 'address') {
        setSavedAddress(null);
        setAddress(toAddressForm(null, fullName, userPhone));
      } else {
        setSavedPayment(null);
        setPayment(emptyPayment);
      }
      setStatus(idle);
    } catch (err) {
      setStatus({
        saving: false,
        error: err instanceof Error ? err.message : 'Network error. Please try again.',
        saved: false,
      });
    }
  }

  function handleAddressSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const missing = (
      [
        ['recipient_name', 'full name'],
        ['country', 'country'],
        ['city', 'city'],
        ['street_address', 'street address'],
      ] as const
    ).filter(([key]) => !address[key].trim());

    if (missing.length > 0) {
      setAddressStatus({
        saving: false,
        error: `Please fill in: ${missing.map(([, label]) => label).join(', ')}.`,
        saved: false,
      });
      return;
    }
    void save('address', address);
  }

  function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const expired =
      Number(payment.exp_year) === currentYear &&
      Number(payment.exp_month) < new Date().getMonth() + 1;

    let error: string | null = null;
    if (!payment.card_brand) error = 'Choose a card type.';
    else if (!/^\d{4}$/.test(payment.last_four)) error = 'Enter the last 4 digits of your card.';
    else if (!payment.exp_month || !payment.exp_year) error = 'Choose the card expiry date.';
    else if (expired) error = 'This card has expired.';

    if (error) {
      setPaymentStatus({ saving: false, error, saved: false });
      return;
    }
    void save('payment', payment);
  }

  return (
    <div className="min-h-[60vh] bg-[#fafafa]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-7">
          <p className="text-sm font-medium text-[#777777]">
            <Link href="/profile" className="transition-colors hover:text-[#252525]">
              Account
            </Link>
            {' / '}
            <span aria-current="page">Settings</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#252525] sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#777777]">
            Save your shipping address and payment details once. We&apos;ll fill them in for you at
            checkout.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <ProfileSidebar
            name={user.full_name}
            avatarSrc={avatar.src}
            onLogout={handleLogout}
            active="settings"
            isAdmin={user.role === 'admin'}
          />

          <div className="min-w-0 space-y-6">
            {loadError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {loadError}
              </p>
            )}

            {/* Shipping */}
            <section aria-labelledby="shipping-heading" className={panelClass}>
              <SectionHeader
                icon={MapPin}
                id="shipping-heading"
                title="Shipping address"
                description="Where should we deliver your orders?"
              />

              {loading ? (
                <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-11 animate-pulse rounded-xl bg-[#f5f5f5]" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleAddressSubmit} noValidate>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <AuthField
                      label="Full name"
                      name="recipient_name"
                      autoComplete="name"
                      icon={UserRound}
                      value={address.recipient_name}
                      onChange={(e) => setAddressField('recipient_name', e.target.value)}
                    />
                    <AuthField
                      label="Phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      icon={Phone}
                      value={address.phone}
                      onChange={(e) => setAddressField('phone', e.target.value)}
                    />
                    <AuthField
                      label="Country"
                      name="country"
                      autoComplete="country-name"
                      icon={Globe}
                      value={address.country}
                      onChange={(e) => setAddressField('country', e.target.value)}
                    />
                    <AuthField
                      label="City"
                      name="city"
                      autoComplete="address-level2"
                      icon={Home}
                      value={address.city}
                      onChange={(e) => setAddressField('city', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-x-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <AuthField
                      label="Street address"
                      name="street_address"
                      autoComplete="street-address"
                      icon={MapPin}
                      value={address.street_address}
                      onChange={(e) => setAddressField('street_address', e.target.value)}
                    />
                    <AuthField
                      label="ZIP code"
                      name="zip_code"
                      autoComplete="postal-code"
                      icon={Hash}
                      value={address.zip_code}
                      onChange={(e) => setAddressField('zip_code', e.target.value)}
                    />
                  </div>

                  <AuthField
                    label="Delivery notes"
                    name="address_details"
                    hint="Optional: building, floor, landmark, or anything that helps the courier."
                    value={address.address_details}
                    onChange={(e) => setAddressField('address_details', e.target.value)}
                  />

                  <FormFooter
                    status={addressStatus}
                    hasSaved={savedAddress !== null}
                    onRemove={() => void remove('address')}
                    savedMessage="Your shipping address has been saved."
                  />
                </form>
              )}
            </section>

            {/* Payment */}
            <section aria-labelledby="payment-heading" className={panelClass}>
              <SectionHeader
                icon={CreditCard}
                id="payment-heading"
                title="Payment method"
                description="Save your card details for faster checkout."
                tone="grey"
              />

              {loading ? (
                <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading">
                  {Array.from({ length: 2 }, (_, i) => (
                    <div key={i} className="h-11 animate-pulse rounded-xl bg-[#f5f5f5]" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} noValidate>
                  <div className="grid gap-x-4 sm:grid-cols-2">
                    <SelectField
                      label="Card type"
                      value={payment.card_brand}
                      onChange={(v) => setPaymentField('card_brand', v)}
                      placeholder="Select card type"
                      options={CARD_BRANDS}
                    />
                    <AuthField
                      label="Last 4 digits"
                      name="last_four"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="1234"
                      icon={CreditCard}
                      value={payment.last_four}
                      onChange={(e) =>
                        setPaymentField('last_four', e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                    />
                    <SelectField
                      label="Expiry month"
                      value={payment.exp_month}
                      onChange={(v) => setPaymentField('exp_month', v)}
                      placeholder="Month"
                      options={MONTHS}
                      autoComplete="cc-exp-month"
                    />
                    <SelectField
                      label="Expiry year"
                      value={payment.exp_year}
                      onChange={(v) => setPaymentField('exp_year', v)}
                      placeholder="Year"
                      options={years}
                      autoComplete="cc-exp-year"
                    />
                  </div>

                  <p className="mb-5 rounded-lg bg-[#fafafa] px-3 py-2.5 text-xs leading-5 text-[#777777]">
                    For your security we never store your full card number or security code. You
                    will enter those at checkout.
                  </p>

                  <FormFooter
                    status={paymentStatus}
                    hasSaved={savedPayment !== null}
                    onRemove={() => void remove('payment')}
                    savedMessage="Your payment details have been saved."
                  />
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}