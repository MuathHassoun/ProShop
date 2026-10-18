// app/products/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ActiveFilters from '@/components/category/ActiveFilters';
import { FilterSidebar, MobileFilters, SortSelect } from '@/components/category/CategoryFilters';
import CategoryPageSkeleton from '@/components/category/CategoryPageSkeleton';
import CategoryProductGrid from '@/components/category/CategoryProductGrid';
import Pagination from '@/components/category/Pagination';
import { getCategories } from '@/lib/categories';
import { CLEARED, PAGE_SIZE, hrefWith, parseFilters } from '@/lib/catalog-params';
import { getAllFacets, getAllProducts } from '@/lib/products';

type SearchParams = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<SearchParams> };

const BASE_PATH = '/products';
const linkFocus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

export const metadata: Metadata = {
  title: 'All products | ProShop',
  description: 'Browse every product at ProShop. Filter by brand, price and availability.',
  alternates: { canonical: BASE_PATH },
};

async function ProductsContent({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams);

  const [categories, facets, { products, total }] = await Promise.all([
    getCategories('top'),
    getAllFacets(),
    getAllProducts(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(total, filters.page * PAGE_SIZE);

  const bounds =
    facets.minPrice !== null && facets.maxPrice !== null
      ? { min: facets.minPrice, max: facets.maxPrice }
      : null;

  return (
    <>
      <header className="rounded-2xl bg-slate-50 px-5 py-6 sm:px-8 sm:py-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-neutral-500">
            <li>
              <Link href="/" className={`rounded hover:text-neutral-900 ${linkFocus}`}>
                Home
              </Link>
            </li>
            <li aria-hidden className="text-neutral-300">
              /
            </li>
            <li aria-current="page" className="text-neutral-800">
              Products
            </li>
          </ol>
        </nav>

        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          All products
        </h1>
        <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-yellow-400" />
        <p className="mt-3 text-sm text-neutral-500">
          {facets.total} {facets.total === 1 ? 'product' : 'products'}
        </p>

        {categories.length > 0 && (
          <nav aria-label="Shop by category" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className={`inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium shadow-sm transition hover:bg-yellow-400 ${linkFocus}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <section aria-labelledby="all-products-heading" className="mt-8">
        <h2 id="all-products-heading" className="sr-only">
          Product list
        </h2>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <FilterSidebar brands={facets.brands} bounds={bounds} />

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600" aria-live="polite">
                {total === 0 ? 'No products' : `Showing ${start}–${end} of ${total}`}
              </p>
              <div className="flex items-center gap-3">
                <MobileFilters brands={facets.brands} bounds={bounds} resultCount={total} />
                <SortSelect />
              </div>
            </div>

            <ActiveFilters basePath={BASE_PATH} filters={filters} brands={facets.brands} />

            {products.length > 0 ? (
              <CategoryProductGrid products={products} />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
                <p className="font-medium">No products to show</p>
                <p className="max-w-sm text-sm text-neutral-500">
                  Nothing matches these filters. Remove a filter or widen the price range to see more.
                </p>
                <Link
                  href={hrefWith(BASE_PATH, filters, CLEARED)}
                  className={`mt-2 inline-flex h-10 items-center rounded-lg bg-yellow-400 px-5 text-sm font-semibold transition hover:bg-yellow-300 ${linkFocus}`}
                >
                  Clear filters
                </Link>
              </div>
            )}

            <Pagination basePath={BASE_PATH} filters={filters} totalPages={totalPages} />
          </div>
        </div>
      </section>
    </>
  );
}

export default function ProductsPage(props: PageProps) {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-15 lg:py-10 xl:px-0">
      <Suspense fallback={<CategoryPageSkeleton />}>
        <ProductsContent {...props} />
      </Suspense>
    </div>
  );
}
