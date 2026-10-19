// components/profile/Wishlist.tsx
'use client';
import Link from 'next/link';
import { Bookmark, Trash2 } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { useClearWishlist, useMounted } from '@/store/useWishlist';
import { formatBadgeCount } from '@/lib/format';
import type { Product } from '@/types';

export function Wishlist() {
  const dispatch = useAppDispatch();
  const mounted = useMounted();
  const user = useAppSelector((s) => s.user.userInfo);
  const items = useAppSelector((s) => s.wishlist.items);
  const status = useAppSelector((s) => s.wishlist.status);
  const clearWishlist = useClearWishlist();
  const cartItems = useAppSelector((s) => s.cart.cartItems);

  const handleAddToCart = (product: Product) => {
    const stock = product.stock_quantity ?? 0;
    if (stock <= 0 || product.variant_id === undefined) return;
    const variantId = product.variant_id;
    const inCart = cartItems.find((i) => i.variant_id === variantId)?.quantity ?? 0;
    const hasDiscount =
      product.discount_price !== null &&
      product.discount_price !== undefined &&
      product.discount_price < product.price;

    dispatch(
      addToCart({
        variant_id: variantId,
        product_id: product.product_id,
        name: product.name,
        slug: product.slug,
        price: hasDiscount ? (product.discount_price as number) : product.price,
        image_url: product.image_url ?? '',
        stock_quantity: stock,
        quantity: Math.min(inCart + 1, stock),
      })
    );
  };

  const loading = !mounted || (!!user && status === 'idle');
  const list = loading ? [] : items;

  return (
    <section aria-labelledby="wishlist-heading" className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-[#eeeeee] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#777777]">
            <Link href="/profile" className="transition-colors hover:text-[#252525]">
              Account
            </Link>
            {' / '}
            <span aria-current="page">Wishlist</span>
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff8cc] text-[#252525]">
              <Bookmark size={22} aria-hidden="true" className="fill-[#fdde0b]" />
            </span>

            <h1 id="wishlist-heading" className="text-2xl font-bold tracking-tight text-[#252525] sm:text-3xl">
              Wishlist
            </h1>

            {!loading && user && list.length > 0 && (
              <span
                className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fdde0b] px-2 text-sm font-bold text-[#252525]"
                aria-label={`${list.length} ${list.length === 1 ? 'item' : 'items'}`}
              >
                {formatBadgeCount(list.length)}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-[#777777]">
            {loading
              ? 'Loading your saved products…'
              : !user
                ? 'Sign in to see the products you saved.'
                : list.length === 0
                  ? 'Products you save will show up here.'
                  : `${list.length} ${list.length === 1 ? 'product' : 'products'} saved for later.`}
          </p>
        </div>

        {list.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/products"
              className="inline-flex min-h-10 items-center rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-[#555555] transition-colors hover:bg-[#f5f5f5] hover:text-[#252525]"
            >
              Keep shopping
            </Link>
            <button
              type="button"
              onClick={() => void clearWishlist()}
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-[#555555] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} aria-hidden="true" />
              Clear all
            </button>
          </div>
        )}
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-[#f1f1f1]" />
          ))}
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <Bookmark size={32} aria-hidden="true" className="text-[#bbbbbb]" />
          <p className="font-semibold text-[#252525]">Sign in to see your wishlist</p>
          <p className="max-w-sm text-sm text-[#777777]">Your saved products are kept on your account.</p>
          <Link
            href="/login"
            className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-[#fdde0b] px-4 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200]"
          >
            Sign in
          </Link>
        </div>
      ) : status === 'error' ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-medium text-red-600">
          Could not load your wishlist. Please refresh the page.
        </p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <Bookmark size={32} aria-hidden="true" className="text-[#bbbbbb]" />
          <p className="font-semibold text-[#252525]">Your wishlist is empty</p>
          <p className="max-w-sm text-sm text-[#777777]">
            Tap the bookmark on any product to save it here for later.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-flex min-h-10 items-center rounded-lg bg-[#fdde0b] px-4 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200]"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((product) => (
            <li key={product.product_id} className="min-w-0">
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Wishlist;