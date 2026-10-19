// components/product/ProductDetails.tsx
'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Check, Minus, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { useToggleWishlist, useWishlisted } from '@/store/useWishlist';
import { formatPrice } from '@/lib/format';
import ProductGallery from './ProductGallery';
import type { Product, ProductImage, ProductSpec, ProductVariant } from '@/types';

interface Props {
  product: Product;
  images: ProductImage[];
  specs: ProductSpec[];
  variants: ProductVariant[];
  reviewsSlot: ReactNode;
}

const COLORS: Record<string, string> = {
  silver: '#e5e5e5',
  gold: '#f5d9b8',
  'midnight green': '#4e5851',
  green: '#4e5851',
  'space gray': '#535150',
  'space grey': '#535150',
  gray: '#6b7280',
  grey: '#6b7280',
  black: '#111827',
  white: '#f5f5f5',
  blue: '#3b82f6',
  red: '#ef4444',
  pink: '#f9a8d4',
  purple: '#a855f7',
  yellow: '#facc15',
  orange: '#fb923c',
};

const isColorKey = (key: string) => ['color', 'colour'].includes(key.toLowerCase());

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-6 text-xl font-semibold tracking-tight sm:text-2xl">
      {children}
    </h2>
  );
}

export default function ProductDetails({ product, images, specs, variants, reviewsSlot }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const gallery = useMemo(() => {
    const urls = images.map((i) => i.image_url);
    if (!urls.length && product.image_url) urls.push(product.image_url);
    return urls;
  }, [images, product.image_url]);

  const optionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const v of variants) {
      for (const [key, value] of Object.entries(v.options)) {
        const list = groups.get(key) ?? [];
        if (!list.includes(value)) list.push(value);
        groups.set(key, list);
      }
    }
    return Array.from(groups.entries());
  }, [variants]);

  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(optionGroups.map(([key, values]) => [key, values[0]]))
  );
  const activeVariant = useMemo(
    () =>
      variants.find((v) => Object.entries(selected).every(([k, val]) => v.options[k] === val)) ??
      variants[0] ??
      null,
    [variants, selected]
  );
  const variantId = activeVariant?.variant_id ?? product.variant_id ?? 0;
  const inCart = useAppSelector(
    (s) => s.cart.cartItems.find((i) => i.variant_id === variantId)?.quantity ?? 0
  );
  const wishlisted = useWishlisted(product.product_id);
  const toggleWishlist = useToggleWishlist();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const basePrice = activeVariant?.price ?? product.price;
  const baseDiscount = activeVariant ? activeVariant.discount_price : product.discount_price;
  const hasDiscount =
    baseDiscount !== null && baseDiscount !== undefined && baseDiscount < basePrice;
  const price = hasDiscount ? (baseDiscount as number) : basePrice;
  const discountPct = hasDiscount ? Math.round((1 - price / basePrice) * 100) : 0;
  const stock = activeVariant?.stock_quantity ?? product.stock_quantity ?? 0;
  const inStock = stock > 0;
  const remaining = Math.max(stock - inCart, 0);
  const canAddMore = remaining > 0;

  const handleAdd = () => {
    if (!inStock || !canAddMore) return;
    dispatch(
      addToCart({
        variant_id: variantId,
        variant_name: activeVariant?.variant_name ?? null,
        product_id: product.product_id,
        name: product.name,
        slug: product.slug,
        price,
        image_url: product.image_url ?? gallery[0] ?? '',
        stock_quantity: stock,
        quantity: Math.min(inCart + quantity, stock),
      })
    );
    setQuantity(1);
    setAdded(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1800);
  };

  const ctaLabel = !inStock ? 'Out of stock' : !canAddMore ? 'Max quantity in cart' : added ? 'Added to cart' : 'Add to cart';
  const ctaDisabled = !inStock || !canAddMore;

  const stockLabel = !inStock ? 'Out of stock' : stock <= 5 ? `Only ${stock} left` : 'In stock';
  const stockTone = !inStock ? 'bg-red-500' : stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-neutral-500">
        <button
          type="button"
          onClick={() => router.back()}
          className={`-ml-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 hover:text-neutral-900 ${focusRing}`}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back
        </button>
        <span aria-hidden className="text-neutral-300">/</span>
        <span className="truncate text-neutral-800" aria-current="page">
          {product.name}
        </span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        {/* Gallery */}
        <ProductGallery
          images={gallery}
          name={product.name}
          badge={hasDiscount ? `-${discountPct}%` : undefined}
        />

        {/* Buy box */}
        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6 lg:max-w-xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {product.name}
              </h1>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wishlisted}
                className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200 transition hover:bg-neutral-100 ${focusRing}`}
              >
                <Bookmark className={`size-5 ${wishlisted ? 'fill-neutral-900' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className={`text-3xl font-semibold tabular-nums ${hasDiscount ? 'text-red-600' : ''}`}>
                {formatPrice(price)}
              </p>
              {hasDiscount && (
                <p className="text-base text-neutral-400 line-through tabular-nums">
                  {formatPrice(basePrice)}
                </p>
              )}
            </div>

            <p className="flex items-center gap-2 text-sm text-neutral-600">
              <span className={`size-2 rounded-full ${stockTone}`} aria-hidden />
              {stockLabel}
            </p>
          </div>

          {optionGroups.map(([key, values]) => (
            <fieldset key={key} className="flex flex-col gap-3">
              <legend className="mb-3 text-sm">
                <span className="capitalize text-neutral-500">{key}</span>
                <span className="ml-2 font-semibold">{selected[key]}</span>
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {values.map((value) => {
                  const active = selected[key] === value;
                  if (isColorKey(key)) {
                    return (
                      <button
                        key={value}
                        type="button"
                        title={value}
                        aria-label={value}
                        aria-pressed={active}
                        onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                        className={`size-9 cursor-pointer rounded-full ring-offset-2 transition ${focusRing} ${
                          active ? 'ring-2 ring-neutral-900' : 'ring-1 ring-neutral-300 hover:ring-neutral-500'
                        }`}
                        style={{ backgroundColor: COLORS[value.toLowerCase()] ?? value }}
                      />
                    );
                  }
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelected((s) => ({ ...s, [key]: value }))}
                      className={`min-h-10 cursor-pointer rounded-lg border px-4 text-sm transition ${focusRing} ${
                        active
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {/* Quantity + desktop CTA */}
          {inStock && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-neutral-500" id="qty-label">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <div
                  role="group"
                  aria-labelledby="qty-label"
                  className="inline-flex h-12 items-center rounded-lg border border-neutral-300"
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className={`flex size-12 cursor-pointer items-center justify-center rounded-l-lg hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${focusRing}`}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium tabular-nums" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(Math.max(remaining, 1), q + 1))}
                    disabled={quantity >= remaining}
                    aria-label="Increase quantity"
                    className={`flex size-12 cursor-pointer items-center justify-center rounded-r-lg hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${focusRing}`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={ctaDisabled}
                  className={`hidden h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 text-base font-semibold text-neutral-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 lg:flex ${focusRing}`}
                >
                  {added && <Check className="size-5" aria-hidden />}
                  {ctaLabel}
                </button>
              </div>
              {inCart > 0 && (
                <p className="text-xs text-neutral-500">{inCart} already in your cart</p>
              )}
            </div>
          )}

          {!inStock && (
            <button
              type="button"
              disabled
              className="hidden h-12 cursor-not-allowed items-center justify-center rounded-lg bg-yellow-400 px-6 text-base font-semibold opacity-50 lg:flex"
            >
              Out of stock
            </button>
          )}

          {product.description && (
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="mb-2 text-sm font-semibold">About this product</h2>
              <p className="max-w-prose text-sm leading-6 text-neutral-600">{product.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Specification */}
      {specs.length > 0 && (
        <section aria-labelledby="spec-heading" className="mt-14 border-t border-neutral-200 pt-10">
          <SectionTitle id="spec-heading">Specification</SectionTitle>
          <dl className="grid gap-x-12 md:grid-cols-2">
            {specs.map((spec) => (
              <div
                key={spec.spec_id}
                className="flex justify-between gap-6 border-b border-neutral-100 py-3 text-sm"
              >
                <dt className="shrink-0 text-neutral-500">{spec.spec_key}</dt>
                <dd className="break-words text-right font-medium">{spec.spec_value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Reviews (streamed from the page via Suspense) */}
      <section aria-labelledby="reviews-heading" className="mt-14 border-t border-neutral-200 pt-10">
        <SectionTitle id="reviews-heading">Reviews</SectionTitle>
        {reviewsSlot}
      </section>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4">
          <div className="min-w-0">
            <p className={`text-lg font-semibold leading-tight tabular-nums ${hasDiscount ? 'text-red-600' : ''}`}>
              {formatPrice(price)}
            </p>
            <p className="truncate text-xs text-neutral-500">{stockLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={ctaDisabled}
            className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 text-base font-semibold text-neutral-900 transition active:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            {added && <Check className="size-5" aria-hidden />}
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}