// components/category/CategoryFilters.tsx
'use client';
import { useCallback, useMemo, useOptimistic, useRef, useTransition } from 'react';
import type { SyntheticEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  CLEARED,
  SORT_OPTIONS,
  activeFilterCount,
  parseFilters,
  toSearchParams,
  type CatalogFilters,
  type SortKey,
} from '@/lib/catalog-params';

export interface BrandFacet {
  brand_id: number;
  name: string;
  count: number;
}

export interface PriceBounds {
  min: number;
  max: number;
}

interface PanelProps {
  brands: BrandFacet[];
  bounds: PriceBounds | null;
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const fromUrl = useMemo(
    () => parseFilters(Object.fromEntries(searchParams.entries())),
    [searchParams]
  );
  const [filters, setOptimistic] = useOptimistic(fromUrl);

  const apply = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const next: CatalogFilters = { ...filters, page: 1, ...patch };
      const qs = toSearchParams(next).toString();
      startTransition(() => {
        setOptimistic(next);
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [filters, pathname, router, setOptimistic]
  );

  return { filters, apply, pending };
}

function CheckRow({
  checked,
  onChange,
  children,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md py-1.5 text-sm hover:text-neutral-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`size-4 shrink-0 cursor-pointer rounded accent-neutral-900 ${focusRing}`}
      />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-neutral-400">{count}</span>}
    </label>
  );
}

function PriceInput({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: number | null;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
        $
      </span>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        aria-label={label}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border border-neutral-300 bg-white pl-7 pr-2 text-sm tabular-nums ${focusRing}`}
      />
    </div>
  );
}

function FilterPanel({ brands, bounds, showTitle = true }: PanelProps & { showTitle?: boolean }) {
  const { filters, apply, pending } = useCatalogFilters();
  const active = activeFilterCount(filters);

  const toggleBrand = (id: number) =>
    apply({
      brands: filters.brands.includes(id)
        ? filters.brands.filter((b) => b !== id)
        : [...filters.brands, id],
    });

  const onPrice = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const read = (key: string) => {
      const raw = String(data.get(key) ?? '').trim();
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) && n >= 0 ? n : null;
    };
    let min = read('min');
    let max = read('max');
    if (min !== null && max !== null && min > max) [min, max] = [max, min];
    apply({ minPrice: min, maxPrice: max });
  };

  return (
    <div
      aria-busy={pending}
      className={`flex flex-col divide-y divide-neutral-200 transition-opacity ${pending ? 'opacity-70' : ''}`}
    >
      {(showTitle || active > 0) && (
        <div className={`flex items-center pb-4 ${showTitle ? 'justify-between' : 'justify-end'}`}>
          {showTitle && <h2 className="text-base font-semibold">Filters</h2>}
          {active > 0 && (
            <button
              type="button"
              onClick={() => apply(CLEARED)}
              className={`cursor-pointer rounded text-sm text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline ${focusRing}`}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <fieldset className="py-4">
        <legend className="mb-2 p-0 text-sm font-semibold">Availability</legend>
        <CheckRow checked={filters.inStock} onChange={() => apply({ inStock: !filters.inStock })}>
          In stock
        </CheckRow>
        <CheckRow checked={filters.onSale} onChange={() => apply({ onSale: !filters.onSale })}>
          On sale
        </CheckRow>
      </fieldset>

      {brands.length > 0 && (
        <fieldset className="py-4">
          <legend className="mb-2 p-0 text-sm font-semibold">Brand</legend>
          <div className="flex max-h-64 flex-col overflow-y-auto pr-1">
            {brands.map((b) => (
              <CheckRow
                key={b.brand_id}
                checked={filters.brands.includes(b.brand_id)}
                onChange={() => toggleBrand(b.brand_id)}
                count={b.count}
              >
                {b.name}
              </CheckRow>
            ))}
          </div>
        </fieldset>
      )}

      <form
        key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
        onSubmit={onPrice}
        className="pt-4"
      >
        <p className="mb-2 text-sm font-semibold">Price</p>
        <div className="flex items-center gap-2">
          <PriceInput
            name="min"
            label="Minimum price"
            defaultValue={filters.minPrice}
            placeholder={bounds ? String(Math.floor(bounds.min)) : 'Min'}
          />
          <span aria-hidden className="text-neutral-400">
            –
          </span>
          <PriceInput
            name="max"
            label="Maximum price"
            defaultValue={filters.maxPrice}
            placeholder={bounds ? String(Math.ceil(bounds.max)) : 'Max'}
          />
        </div>
        <button
          type="submit"
          className={`mt-3 h-10 w-full cursor-pointer rounded-lg bg-neutral-100 text-sm font-medium transition hover:bg-yellow-400 ${focusRing}`}
        >
          Apply price
        </button>
      </form>
    </div>
  );
}

export function FilterSidebar(props: PanelProps) {
  return (
    <aside
      aria-label="Filters"
      className="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100svh-3rem)] lg:self-start lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-neutral-200 lg:p-5"
    >
      <FilterPanel {...props} />
    </aside>
  );
}

export function MobileFilters({ resultCount, ...panel }: PanelProps & { resultCount: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { filters } = useCatalogFilters();
  const active = activeFilterCount(filters);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium transition hover:border-neutral-500 lg:hidden ${focusRing}`}
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
        {active > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold">
            {active}
          </span>
        )}
      </button>

      <dialog
        ref={ref}
        aria-label="Filters"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(88vw,360px)] max-w-none bg-white p-0 backdrop:bg-black/40 open:flex open:flex-col lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="text-base font-semibold">Filters</h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close filters"
            className={`flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100 ${focusRing}`}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <FilterPanel {...panel} showTitle={false} />
        </div>

        <div className="border-t border-neutral-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className={`h-12 w-full cursor-pointer rounded-lg bg-yellow-400 text-base font-semibold transition hover:bg-yellow-300 ${focusRing}`}
          >
            {resultCount === 1 ? 'Show 1 product' : `Show ${resultCount} products`}
          </button>
        </div>
      </dialog>
    </>
  );
}

export function SortSelect() {
  const { filters, apply, pending } = useCatalogFilters();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-neutral-500 sm:inline">Sort by</span>
      <select
        value={filters.sort}
        onChange={(e) => apply({ sort: e.target.value as SortKey })}
        aria-busy={pending}
        className={`h-10 cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 text-sm ${focusRing}`}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}