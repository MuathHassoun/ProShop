// components/product/product_card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Star, StarHalf } from 'lucide-react';
import type { Product } from '@/types';

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
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
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
  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    product.discount_price < product.price;
  const price = hasDiscount ? (product.discount_price as number) : product.price;
  const inStock = (product.stock_quantity ?? 0) > 0;

  return (
    <article className="flex h-full w-full flex-col items-center gap-2 rounded-2xl bg-white px-2 pb-2 pt-0 text-neutral-800 shadow-sm transition hover:shadow-md sm:gap-3 sm:px-3 sm:pb-3">
      <Link href={`/product/${product.slug}`} className="flex w-full flex-col items-center gap-1.5 sm:gap-2">
        <div className="relative aspect-[4/5] w-full">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-black">
              <span className="text-yellow-400">Pro</span>Shop
            </div>
          )}
        </div>
        
        <h3 className="line-clamp-2 min-h-[2.5rem] text-center text-sm sm:text-base">{product.name}</h3>
      </Link>

      <Rating value={product.rating ?? 0} />

      <div className="flex items-baseline gap-2">
        <p className="text-lg font-bold sm:text-xl">{formatPrice(price)}</p>
        {hasDiscount && (
          <p className="text-xs text-neutral-400 line-through sm:text-sm">{formatPrice(product.price)}</p>
        )}
      </div>

      <div className="mt-auto flex w-full items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => onToggleWishlist?.(product)}
          aria-label="Add to wishlist"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-neutral-100 transition hover:bg-yellow-400 sm:size-11"
        >
          <Bookmark className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onAddToCart?.(product)}
          disabled={!inStock}
          className="h-10 min-w-0 flex-1 cursor-pointer truncate rounded-lg bg-neutral-100 px-3 text-sm transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-neutral-100 sm:h-11 sm:text-base"
        >
          {inStock ? 'Add To Cart' : 'Out of stock'}
        </button>
      </div>
    </article>
  );
}