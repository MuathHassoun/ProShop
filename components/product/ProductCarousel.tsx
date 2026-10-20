// components/product/ProductCarousel.tsx
'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import SeeMoreCard from '../common/cards/SeeMoreCard';
import type { Product } from '@/types';

interface Props {
  id: string;
  title: string;
  products: Product[];
  align?: 'left' | 'center';
  className?: string;
  seeMoreHref?: string;
}

const AUTOPLAY_MS = 4000;
const SM = '(min-width: 640px)';
const LG = '(min-width: 1024px)';

function subscribe(onChange: () => void) {
  const sm = window.matchMedia(SM);
  const lg = window.matchMedia(LG);
  sm.addEventListener('change', onChange);
  lg.addEventListener('change', onChange);
  return () => {
    sm.removeEventListener('change', onChange);
    lg.removeEventListener('change', onChange);
  };
}

const getSnapshot = () =>
  window.matchMedia(LG).matches ? 4 : window.matchMedia(SM).matches ? 2 : 1;
const getServerSnapshot = () => 4;

function usePerPage() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function ProductCarousel(props: Props) {
  const perPage = usePerPage();
  if (props.products.length === 0) return null;

  return <Slider key={perPage} perPage={perPage} {...props} />;
}

function Slider({
  id,
  title,
  products,
  align = 'left',
  className = '',
  seeMoreHref,
  perPage,
}: Props & { perPage: number }) {
  const centered = align === 'center';
  const dispatch = useAppDispatch();
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
        original_price: hasDiscount ? product.price : null,
        image_url: product.image_url ?? '',
        stock_quantity: stock,
        quantity: Math.min(inCart + 1, stock),
      })
    );
  };

  const items: (Product | 'more')[] = seeMoreHref ? [...products, 'more'] : products;

  const pages: (Product | 'more')[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  const count = pages.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused, count, next]);

  const dots =
    count > 1 ? (
      <div className="flex items-center gap-2" role="tablist" aria-label={`${title} slides`}>
        {pages.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 cursor-pointer rounded-full transition-all ${
              i === index ? 'w-6 bg-yellow-400' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    ) : null;

  return (
    <section
      aria-labelledby={id}
      aria-roledescription="carousel"
      className={`py-4 sm:py-6 ${className}`}
    >
      {/* Header */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-15 md:px-15 xl:px-0">
        <div
          className={`relative mb-4 flex items-center border-b border-neutral-200 pb-3 ${
            centered ? 'justify-center' : 'justify-between'
          }`}
        >
          <h2 id={id} className="text-base font-bold uppercase tracking-wide sm:text-lg lg:text-xl">
            {title}
          </h2>

          <span
            aria-hidden
            className={`absolute -bottom-px h-[4px] w-12 rounded-full bg-yellow-400 sm:w-35 ${
              centered ? 'left-1/2 -translate-x-1/2' : 'left-0'
            }`}
          />

          {/* Top rated: dots in the header from md up (small devices use the bottom row) */}
          {!centered && dots && <div className="hidden md:flex">{dots}</div>}
        </div>
      </div>

      {/* Slider */}
      <div
        className="relative mx-auto max-w-[1500px] px-4 sm:px-15 md:px-15 xl:px-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="overflow-hidden py-2">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {pages.map((page, p) => (
              <div
                key={p}
                role="group"
                aria-roledescription="slide"
                aria-label={`${p + 1} of ${count}`}
                aria-hidden={p !== index}
                inert={p !== index}
                className="grid w-full shrink-0 grid-cols-1 content-start gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4"
              >
                {page.map((item) =>
                  item === 'more' ? (
                    <SeeMoreCard key="more" href={seeMoreHref!} />
                  ) : (
                    <ProductCard key={item.slug} product={item} onAddToCart={handleAddToCart} />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-1 top-[33%] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-yellow-400 sm:left-8 sm:size-10 lg:size-12 xl:-left-5"
            >
              <ChevronLeft className="size-5 lg:size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute right-1 top-[33%] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-yellow-400 sm:right-8 sm:size-10 lg:size-12 xl:-right-5"
            >
              <ChevronRight className="size-5 lg:size-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom dots: always for Featured products, only below md for Top rated */}
      {dots && (
        <div className={`mt-4 flex justify-center ${centered ? '' : 'md:hidden'}`}>{dots}</div>
      )}
    </section>
  );
}