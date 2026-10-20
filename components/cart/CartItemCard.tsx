// components/cart/CartItemCard.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import { formatPrice } from '@/lib/format';
import type { CartItem } from '@/types';

const stepButton =
  'flex h-full w-9 shrink-0 cursor-pointer items-center justify-center bg-yellow-400 text-neutral-900 transition hover:bg-yellow-500 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-yellow-400';

export function CartItemCard({ item }: { item: CartItem }) {
  const dispatch = useAppDispatch();
  const max = item.stock_quantity || 99;
  const hasDiscount = item.original_price != null && item.original_price > item.price;
  const discountPct = hasDiscount
    ? Math.round((1 - item.price / (item.original_price as number)) * 100)
    : 0;
  const lineTotal = item.price * item.quantity;
  const lineOriginal = hasDiscount ? (item.original_price as number) * item.quantity : null;
  const lowStock = !!item.stock_quantity && item.stock_quantity <= 5;

  const setQuantity = (quantity: number) =>
    dispatch(updateQuantity({ variant_id: item.variant_id, quantity }));

  return (
    <li className="grid grid-cols-[88px_1fr] items-center gap-x-4 gap-y-4 rounded-2xl bg-white p-4 text-neutral-800 shadow-sm transition hover:shadow-md sm:grid-cols-[112px_1fr_auto_auto] sm:gap-x-6 sm:p-5">
      {/* Image */}
      <Link
        href={`/product/${item.slug}`}
        className="relative block aspect-square w-full overflow-hidden rounded-xl bg-neutral-50 sm:size-28"
        tabIndex={-1}
        aria-hidden="true"
      >
        {item.image_url && (
          <Image
            src={item.image_url}
            alt=""
            fill
            sizes="(min-width: 640px) 112px, 88px"
            className="object-contain p-2 mix-blend-multiply"
          />
        )}
      </Link>

      {/* Info */}
      <div className="flex min-w-0 flex-col items-start gap-1">
        <Link
          href={`/product/${item.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug transition hover:text-neutral-600 sm:text-base"
        >
          {item.name}
        </Link>
        {item.variant_name && (
          <p className="text-xs text-neutral-500 sm:text-sm">{item.variant_name}</p>
        )}
        {lowStock && (
          <p className="text-xs font-medium text-red-500">Only {item.stock_quantity} left</p>
        )}
        <button
          type="button"
          onClick={() => dispatch(removeFromCart(item.variant_id))}
          aria-label={`Remove ${item.name} from cart`}
          className="mt-1 flex cursor-pointer items-center gap-1 rounded text-xs text-neutral-500 transition hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          <Trash2 size={14} aria-hidden="true" />
          Remove
        </button>
      </div>

      {/* Quantity + price: own row on mobile, inline columns on desktop */}
      <div className="col-span-2 flex items-center justify-between gap-4 border-t border-neutral-100 pt-4 sm:contents">
        <div
          role="group"
          aria-label={`Quantity of ${item.name}`}
          className="flex h-10 w-32 items-center overflow-hidden rounded-lg bg-neutral-100"
        >
          <button
            type="button"
            onClick={() => setQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className={stepButton}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <output
            aria-live="polite"
            className="flex-1 text-center text-sm font-semibold tabular-nums"
          >
            {item.quantity}
          </output>
          <button
            type="button"
            onClick={() => setQuantity(item.quantity + 1)}
            disabled={item.quantity >= max}
            aria-label="Increase quantity"
            className={stepButton}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-w-24 flex-col items-end text-right">
          {hasDiscount && (
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                -{discountPct}%
              </span>
              <span className="text-xs text-neutral-400 line-through tabular-nums">
                {formatPrice(lineOriginal as number)}
              </span>
            </div>
          )}
          <span
            className={`text-lg font-bold tabular-nums sm:text-xl ${hasDiscount ? 'text-red-500' : ''}`}
          >
            {formatPrice(lineTotal)}
          </span>
          {item.quantity > 1 && (
            <span className="text-xs text-neutral-500 tabular-nums">
              {formatPrice(item.price)} each
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default CartItemCard;