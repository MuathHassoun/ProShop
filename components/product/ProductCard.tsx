// components/product/ProductCard.tsx
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Minus, Plus, Star, StarHalf } from 'lucide-react';
import type { Product } from '@/types';
import { useToggleWishlist, useWishlisted } from '@/store/useWishlist';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';

const COUNTER_MS = 3000;

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex h-5 items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const diff = value - i;
        if (diff >= 1) {
          return <Star key={i} className="size-4 fill-yellow-400 text-yellow-400 sm:size-5" />;
        }
        if (diff >= 0.5) {
          return (
            <span key={i} className="relative inline-flex">
              <Star className="size-4 text-yellow-400 sm:size-5" />
              <StarHalf className="absolute inset-0 size-4 fill-yellow-400 text-yellow-400 sm:size-5" />
            </span>
          );
        }
        return <Star key={i} className="size-4 text-neutral-300 sm:size-5" />;
      })}
    </div>
  );
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist }: Props) {
  const wishlisted = useWishlisted(product.product_id);
  const toggleWishlist = useToggleWishlist();
  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    product.discount_price < product.price;
  const price = hasDiscount ? (product.discount_price as number) : product.price;
  const stock = product.stock_quantity ?? 0;
  const inStock = stock > 0;

  const dispatch = useAppDispatch();
  const variantId = product.variant_id;
  const qty = useAppSelector(
    (s) => s.cart.cartItems.find((i) => i.variant_id === variantId)?.quantity ?? 0
  );

  const [counterOpen, setCounterOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const startTimer = useCallback(() => {
    stopTimer();
    timer.current = setTimeout(() => setCounterOpen(false), COUNTER_MS);
  }, [stopTimer]);
  useEffect(() => stopTimer, [stopTimer]);

  const handleAdd = () => {
    onAddToCart?.(product);
    setCounterOpen(true);
    startTimer();
  };

  const handleStep = (next: number) => {
    if (variantId === undefined) return;
    if (next < 1) {
      dispatch(removeFromCart(variantId));
      stopTimer();
      setCounterOpen(false);
      return;
    }
    dispatch(updateQuantity({ variant_id: variantId, quantity: next }));
    startTimer();
  };

  const showCounter = counterOpen && qty > 0;
  const stepBtn =
    'flex h-full w-11 shrink-0 cursor-pointer items-center justify-center bg-yellow-400 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-yellow-400';

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-neutral-800 shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="flex w-full flex-col">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-neutral-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-black">
              <span className="text-yellow-400">Pro</span>Shop
            </div>
          )}

          {hasDiscount && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white sm:text-sm">
              -{Math.round((1 - price / product.price) * 100)}%
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 min-h-[2.5rem] px-3 pt-3 text-center text-sm leading-5 transition group-hover:text-primary-500 sm:min-h-[3rem] sm:text-base sm:leading-6">
          {product.name}
        </h3>
      </Link>

      <div className="mt-auto flex flex-col items-center gap-2 px-3 pb-3 pt-2 sm:gap-2.5">
        <Rating value={product.rating ?? 0} />

        <div className="flex h-7 items-baseline gap-2 sm:h-8">
          <p className={`text-lg font-bold sm:text-xl ${hasDiscount ? 'text-red-500' : ''}`}>
            {formatPrice(price)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-neutral-400 line-through sm:text-sm">{formatPrice(product.price)}</p>
          )}
        </div>

        <div className="flex w-full items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => (onToggleWishlist ?? toggleWishlist)(product)}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-neutral-100 transition hover:bg-yellow-400 sm:size-11"
          >
            <Bookmark className={`size-5 ${wishlisted ? 'fill-neutral-900' : ''}`} />
          </button>
          {showCounter ? (
            <div
              role="group"
              aria-label="Quantity in cart"
              onMouseEnter={stopTimer}
              onMouseLeave={startTimer}
              className="flex h-10 min-w-0 flex-1 items-center overflow-hidden rounded-lg bg-neutral-100 sm:h-11"
            >
              <button
                type="button"
                onClick={() => handleStep(qty - 1)}
                aria-label={qty <= 1 ? 'Remove from cart' : 'Decrease quantity'}
                className={stepBtn}
              >
                <Minus className="size-4" />
              </button>
              <output
                aria-live="polite"
                className="flex-1 text-center text-sm font-semibold tabular-nums sm:text-base"
              >
                {qty}
              </output>
              <button
                type="button"
                onClick={() => handleStep(qty + 1)}
                disabled={qty >= stock}
                aria-label="Increase quantity"
                className={stepBtn}
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              className="h-10 min-w-0 flex-1 cursor-pointer truncate rounded-lg bg-neutral-100 px-3 text-sm transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neutral-100 sm:h-11 sm:text-base"
            >
              {inStock ? 'Add To Cart' : 'Out of stock'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}