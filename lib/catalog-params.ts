// lib/catalog-params.ts
export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'top-rated', label: 'Top rated' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['value'];
export const DEFAULT_SORT: SortKey = 'featured';

export interface CatalogFilters {
  brands: number[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  onSale: boolean;
  sort: SortKey;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function toNonNegative(v: string | undefined): number | null {
  if (v === undefined || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function parseFilters(raw: RawParams): CatalogFilters {
  const brands = Array.from(
    new Set(
      (first(raw.brand) ?? '')
        .split(',')
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
    )
  ).slice(0, 50);

  let minPrice = toNonNegative(first(raw.min));
  let maxPrice = toNonNegative(first(raw.max));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const sortRaw = first(raw.sort);
  const sort = SORT_OPTIONS.some((o) => o.value === sortRaw) ? (sortRaw as SortKey) : DEFAULT_SORT;

  const pageNum = Math.trunc(Number(first(raw.page)));
  const page = Number.isFinite(pageNum) ? Math.min(Math.max(pageNum, 1), 10000) : 1;

  return {
    brands,
    minPrice,
    maxPrice,
    inStock: first(raw.stock) === '1',
    onSale: first(raw.sale) === '1',
    sort,
    page,
  };
}

export function toSearchParams(f: CatalogFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.brands.length) p.set('brand', f.brands.join(','));
  if (f.minPrice !== null) p.set('min', String(f.minPrice));
  if (f.maxPrice !== null) p.set('max', String(f.maxPrice));
  if (f.inStock) p.set('stock', '1');
  if (f.onSale) p.set('sale', '1');
  if (f.sort !== DEFAULT_SORT) p.set('sort', f.sort);
  if (f.page > 1) p.set('page', String(f.page));
  return p;
}

export function hrefWith(basePath: string, f: CatalogFilters, patch: Partial<CatalogFilters>): string {
  const qs = toSearchParams({ ...f, page: 1, ...patch }).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function activeFilterCount(f: CatalogFilters): number {
  return (
    f.brands.length +
    (f.minPrice !== null || f.maxPrice !== null ? 1 : 0) +
    (f.inStock ? 1 : 0) +
    (f.onSale ? 1 : 0)
  );
}

export const CLEARED: Pick<CatalogFilters, 'brands' | 'minPrice' | 'maxPrice' | 'inStock' | 'onSale'> = {
  brands: [],
  minPrice: null,
  maxPrice: null,
  inStock: false,
  onSale: false,
};