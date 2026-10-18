// components/product/ProductGallery.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: string[];
  name: string;
  badge?: string;
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

const hideScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

const arrowBase =
  'absolute top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md ring-1 ring-black/5 transition hover:bg-white lg:flex opacity-0 group-hover/gallery:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100';

export default function ProductGallery({ images, name, badge }: Props) {
  const count = images.length;
  const [active, setActive] = useState(0);

  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      el.scrollTo({ left: activeRef.current * el.clientWidth });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const r = rail.current;
    const b = thumbs.current[active];
    if (!r || !b) return;
    r.scrollTo({ top: b.offsetTop - (r.clientHeight - b.clientHeight) / 2 });
  }, [active]);

  const goTo = useCallback(
    (index: number) => {
      const el = track.current;
      if (!el) return;
      const next = Math.min(Math.max(index, 0), count - 1);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    },
    [count]
  );

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = track.current;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setActive((prev) => (prev === i ? prev : i));
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') goTo(active + 1);
    else if (e.key === 'ArrowLeft') goTo(active - 1);
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(count - 1);
    else return;
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--ox', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--oy', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  if (count === 0) {
    return (
      <div className="relative flex aspect-square w-full items-center justify-center rounded-2xl bg-neutral-50 text-2xl font-bold">
        <span className="text-yellow-400">Pro</span>Shop
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[780px] flex-col gap-3 lg:flex-row lg:gap-4">
      {count > 1 && (
        <div className="relative hidden lg:order-first lg:block lg:w-[72px] lg:shrink-0">
          <ul
            ref={rail}
            aria-label="Product images"
            className={`absolute inset-0 flex flex-col gap-2 overflow-y-auto ${hideScrollbar}`}
          >
            {images.map((url, i) => (
              <li key={`${url}-${i}`} className="shrink-0">
                <button
                  type="button"
                  ref={(el) => {
                    thumbs.current[i] = el;
                  }}
                  onClick={() => goTo(i)}
                  aria-label={`Show image ${i + 1} of ${count}`}
                  aria-current={i === active ? 'true' : undefined}
                  className={`relative block aspect-square w-full cursor-pointer overflow-hidden rounded-lg bg-neutral-50 transition ${focusRing} ${
                    i === active
                      ? 'ring-2 ring-neutral-900'
                      : 'opacity-60 ring-1 ring-neutral-200 hover:opacity-100'
                  }`}
                >
                  <Image src={url} alt="" fill sizes="72px" className="object-contain p-1" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="group/gallery relative min-w-0 flex-1">
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label={`${name} images`}
          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-50 lg:max-h-[calc(100svh-9rem)]"
        >
          <div
            ref={track}
            tabIndex={count > 1 ? 0 : undefined}
            onScroll={onScroll}
            onKeyDown={count > 1 ? onKeyDown : undefined}
            className={`flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain ${hideScrollbar} ${focusRing}`}
          >
            {images.map((url, i) => (
              <div
                key={`${url}-${i}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                onPointerMove={onPointerMove}
                className="group/slide relative h-full w-full shrink-0 snap-center overflow-hidden lg:cursor-zoom-in"
              >
                <Image
                  src={url}
                  alt={i === 0 ? name : `${name}, image ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  draggable={false}
                  style={{ transformOrigin: 'var(--ox, 50%) var(--oy, 50%)' }}
                  className="object-contain p-5 transition-transform duration-200 ease-out motion-reduce:transition-none sm:p-8 [@media(hover:hover)]:group-hover/slide:scale-[1.8]"
                />
              </div>
            ))}
          </div>

          {badge && (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
              {badge}
            </span>
          )}

          {count > 1 && (
            <>
              <p
                aria-hidden
                className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-neutral-900/70 px-2.5 py-1 text-xs font-medium tabular-nums text-white"
              >
                {active + 1} / {count}
              </p>
              <span className="sr-only" aria-live="polite">
                Image {active + 1} of {count}
              </span>
            </>
          )}
        </div>

        {count > 1 && active > 0 && (
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous image"
            className={`${arrowBase} left-3 ${focusRing}`}
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {count > 1 && active < count - 1 && (
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next image"
            className={`${arrowBase} right-3 ${focusRing}`}
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}