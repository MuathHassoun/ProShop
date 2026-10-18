// components/category/ActiveFilters.tsx
import Link from 'next/link';
import { X } from 'lucide-react';
import { CLEARED, hrefWith, type CatalogFilters } from '@/lib/catalog-params';

interface Props {
  basePath: string;
  filters: CatalogFilters;
  brands: { brand_id: number; name: string }[];
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function priceLabel(min: number | null, max: number | null) {
  if (min !== null && max !== null) return `${money.format(min)} – ${money.format(max)}`;
  if (min !== null) return `From ${money.format(min)}`;
  return `Up to ${money.format(max as number)}`;
}

export default function ActiveFilters({ basePath, filters, brands }: Props) {
  const chips: { key: string; label: string; href: string }[] = [];

  for (const id of filters.brands) {
    const brand = brands.find((b) => b.brand_id === id);
    if (!brand) continue;
    chips.push({
      key: `brand-${id}`,
      label: brand.name,
      href: hrefWith(basePath, filters, { brands: filters.brands.filter((b) => b !== id) }),
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    chips.push({
      key: 'price',
      label: priceLabel(filters.minPrice, filters.maxPrice),
      href: hrefWith(basePath, filters, { minPrice: null, maxPrice: null }),
    });
  }
  if (filters.inStock) {
    chips.push({ key: 'stock', label: 'In stock', href: hrefWith(basePath, filters, { inStock: false }) });
  }
  if (filters.onSale) {
    chips.push({ key: 'sale', label: 'On sale', href: hrefWith(basePath, filters, { onSale: false }) });
  }

  if (chips.length === 0) return null;

  return (
    <div role="group" aria-label="Active filters" className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          scroll={false}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-neutral-100 pl-3 pr-2 text-sm transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          {chip.label}
          <X className="size-3.5" aria-hidden />
        </Link>
      ))}
      <Link
        href={hrefWith(basePath, filters, CLEARED)}
        scroll={false}
        className="rounded px-1 text-sm text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        Clear all
      </Link>
    </div>
  );
}