// components/category/CategoryCarousel.tsx
'use client';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CategoryCard from './CategoryCard';
import SeeMoreCard from '../common/cards/SeeMoreCard';

interface CategoryItem {
  slug: string;
  name: string;
  image_url?: string | null;
}

interface Props {
  categories: CategoryItem[];
  seeMoreHref?: string;
}

const AUTOPLAY_MS = 4000;
const QUERY = '(min-width: 768px)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

const getSnapshot = () => (window.matchMedia(QUERY).matches ? 4 : 2);
const getServerSnapshot = () => 4;

function usePerPage() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function CategoryCarousel({ categories, seeMoreHref }: Props) {
  const perPage = usePerPage();
  if (categories.length === 0) return null;

  return <Slider key={perPage} categories={categories} perPage={perPage} seeMoreHref={seeMoreHref} />;
}

function Slider({ categories, perPage, seeMoreHref }: Props & { perPage: number }) {
  const items: (CategoryItem | 'more')[] = seeMoreHref ? [...categories, 'more'] : categories;

  const pages: (CategoryItem | 'more')[][] = [];
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
    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, count, next]);

  const dots =
    count > 1 ? (
      <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
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
      aria-labelledby="categories-heading"
      aria-roledescription="carousel"
      className="py-4 sm:py-6"
    >
      {/* Header */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-15 md:px-15 xl:px-0">
        <div className="relative mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
          <h2
            id="categories-heading"
            className="text-base font-bold uppercase tracking-wide sm:text-lg lg:text-xl"
          >
            Featured categories
          </h2>

          <span
            aria-hidden
            className="absolute -bottom-px left-0 h-[4px] w-12 rounded-full bg-yellow-400 sm:w-35"
          />

          {/* Dots in the header from md up (small devices use the bottom row) */}
          {dots && <div className="hidden md:flex">{dots}</div>}
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
        <div className="overflow-hidden">
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
                className="grid w-full shrink-0 grid-cols-2 content-start gap-2 sm:gap-3 md:grid-cols-4"
              >
                {page.map((c) =>
                  c === 'more' ? (
                    <SeeMoreCard key="more" href={seeMoreHref!} tinted />
                  ) : (
                    <CategoryCard
                      key={c.slug}
                      name={c.name}
                      image_url={c.image_url}
                      href={`/category/${c.slug}`}
                    />
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
              className="absolute left-1 top-[38%] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-yellow-400 sm:left-8 sm:size-10 md:left-8 lg:size-12 xl:-left-5"
            >
              <ChevronLeft className="size-5 lg:size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="absolute right-1 top-[38%] flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-yellow-400 sm:right-8 sm:size-10 md:right-8 lg:size-12 xl:-right-5"
            >
              <ChevronRight className="size-5 lg:size-6" />
            </button>
          </>
        )}
      </div>

      {/* Small devices: dots centered at the bottom */}
      {dots && <div className="mt-4 flex justify-center md:hidden">{dots}</div>}
    </section>
  );
}