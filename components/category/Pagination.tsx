// components/category/Pagination.tsx
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { hrefWith, type CatalogFilters } from '@/lib/catalog-params';

interface Props {
  basePath: string;
  filters: CatalogFilters;
  totalPages: number;
}

function pageWindow(current: number, total: number): (number | 'gap')[] {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const base =
  'flex size-10 items-center justify-center rounded-lg text-sm tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

export default function Pagination({ basePath, filters, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const { page } = filters;
  const href = (p: number) => hrefWith(basePath, filters, { page: p });

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="Previous page" className={`${base} hover:bg-neutral-100`}>
          <ChevronLeft className="size-5" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} text-neutral-300`}>
          <ChevronLeft className="size-5" />
        </span>
      )}

      {pageWindow(page, totalPages).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} aria-hidden className="flex size-10 items-center justify-center text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={`${base} ${
              item === page ? 'bg-yellow-400 font-semibold' : 'hover:bg-neutral-100'
            }`}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} aria-label="Next page" className={`${base} hover:bg-neutral-100`}>
          <ChevronRight className="size-5" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} text-neutral-300`}>
          <ChevronRight className="size-5" />
        </span>
      )}
    </nav>
  );
}