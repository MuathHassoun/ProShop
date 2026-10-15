// components/product/Advertising.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Product } from '@/types';

interface Props {
  products: Product[];
}

const AUTOPLAY_MS = 4000;
const MAX_SLIDES = 5;

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function Advertising({ products }: Props) {
  const slides = products.slice(0, MAX_SLIDES);
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, count, next]);

  if (count === 0) return null;

  return (
    <section
      className="w-full text-neutral-800"
      aria-roledescription="carousel"
      aria-label="Featured deals"
    >
      <div
        className="relative w-full max-w-full overflow-hidden bg-gray-200 shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((product, i) => {
            const hasDiscount =
              product.discount_price !== null &&
              product.discount_price !== undefined &&
              product.discount_price < product.price;
            const price = hasDiscount ? (product.discount_price as number) : product.price;
            const saved = hasDiscount ? product.price - price : 0;
            const percent = hasDiscount ? Math.round((saved / product.price) * 100) : 0;
            const rating = Math.round(product.rating ?? 0);
            const inStock = (product.stock_quantity ?? 0) > 0;
            const active = i === index;

            return (
              <div
                key={product.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!active}
                inert={!active}
                className="w-full shrink-0"
              >
                <div className="mx-auto flex h-full w-full max-w-[1500px] flex-col gap-5 pb-6 sm:px-15 sm:py-6 md:flex-row md:items-center md:gap-10 md:py-8 lg:gap-16 xl:px-0 2xl:gap-24 2xl:py-12">
                  <div className="relative order-first aspect-[4/3] w-full overflow-hidden bg-white sm:aspect-[16/9] sm:rounded-2xl md:order-last md:aspect-[4/3] md:w-auto md:flex-1 md:basis-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-4xl font-bold text-black sm:text-5xl lg:text-[64px]">
                          <span className="text-yellow-400">Pro</span>Shop
                        </p>
                      </div>
                    )}

                    {hasDiscount && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white sm:left-4 sm:top-4 lg:text-base">
                        -{percent}%
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col items-center gap-3 px-4 text-center sm:gap-4 sm:px-0 md:flex-1 md:basis-0 md:items-start md:text-left 2xl:gap-5">
                    {hasDiscount && (
                      <p className="text-base font-bold uppercase tracking-[0.05em] text-yellow-600 sm:text-lg lg:text-xl">
                        Save {formatPrice(saved)}
                      </p>
                    )}

                    <h2 className="line-clamp-2 text-2xl font-bold sm:text-3xl lg:text-4xl 2xl:text-5xl">
                      {product.name}
                    </h2>

                    {product.description ? (
                      <p className="line-clamp-3 max-w-lg text-sm text-neutral-600 sm:text-base 2xl:max-w-xl 2xl:text-lg">
                        {product.description}
                      </p>
                    ) : null}

                    <div className="flex items-baseline gap-3">
                      <p
                        className={`text-2xl font-bold sm:text-3xl 2xl:text-4xl ${
                          hasDiscount ? 'text-red-500' : ''
                        }`}
                      >
                        {formatPrice(price)}
                      </p>
                      {hasDiscount && (
                        <p className="text-base text-neutral-500 line-through sm:text-lg">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                      {inStock && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:text-sm">
                          In Stock
                        </span>
                      )}
                      <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            size={18}
                            className={s < rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}
                          />
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-2 inline-flex w-full max-w-[260px] items-center justify-center rounded-[15px] bg-yellow-400 px-8 py-3 text-center font-normal tracking-[0.1em] text-black transition hover:text-primary-500 sm:w-[200px] sm:px-11"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-2 top-[25%] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-yellow-400 sm:size-10 md:left-3 md:top-1/2 lg:size-12 xl:left-4"
            >
              <ChevronLeft className="size-5 lg:size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute right-2 top-[25%] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-yellow-400 sm:size-10 md:right-3 md:top-1/2 lg:size-12 xl:right-4"
            >
              <ChevronRight className="size-5 lg:size-6" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Choose slide">
          {slides.map((product, i) => (
            <button
              key={product.slug}
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
      )}
    </section>
  );
}