// app/category/[slug]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ActiveFilters from '@/components/category/ActiveFilters';
import { FilterSidebar, MobileFilters, SortSelect } from '@/components/category/CategoryFilters';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategoryPageSkeleton from '@/components/category/CategoryPageSkeleton';
import CategoryProductGrid from '@/components/category/CategoryProductGrid';
import Pagination from '@/components/category/Pagination';
import { getCategoryBySlug, getCategoryTrail, getSubcategories } from '@/lib/categories';
import { CLEARED, PAGE_SIZE, hrefWith, parseFilters } from '@/lib/catalog-params';
import { getCategoryFacets, getCategoryProducts } from '@/lib/products';

type SearchParams = Record<string, string | string[] | undefined>;
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category not found | ProShop', robots: { index: false } };

  const description = category.description?.slice(0, 155) ?? `Shop ${category.name} at ProShop.`;

  return {
    title: `${category.name} | ProShop`,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: category.name,
      description,
      type: 'website',
      images: category.image_url ? [{ url: category.image_url }] : undefined,
    },
  };
}

async function CategoryContent({ params, searchParams }: PageProps) {
  const [{ slug }, rawSearch] = await Promise.all([params, searchParams]);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters = parseFilters(rawSearch);
  const basePath = `/category/${slug}`;

  const [trail, subcategories, facets, { products, total }] = await Promise.all([
    getCategoryTrail(category.category_id),
    getSubcategories(category.category_id),
    getCategoryFacets(category.category_id),
    getCategoryProducts(category.category_id, filters),
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
      <CategoryHeader
        name={category.name}
        description={category.description}
        imageUrl={category.image_url}
        total={facets.total}
        trail={trail}
        subcategories={subcategories}
      />

      <section aria-labelledby="category-products-heading" className="mt-8">
        <h2 id="category-products-heading" className="sr-only">
          Products in {category.name}
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

            <ActiveFilters basePath={basePath} filters={filters} brands={facets.brands} />

            {products.length > 0 ? (
              <CategoryProductGrid products={products} />
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
                <p className="font-medium">No products to show</p>
                <p className="max-w-sm text-sm text-neutral-500">
                  Nothing matches these filters. Remove a filter or widen the price range to see more.
                </p>
                <Link
                  href={hrefWith(basePath, filters, CLEARED)}
                  className="mt-2 inline-flex h-10 items-center rounded-lg bg-yellow-400 px-5 text-sm font-semibold transition hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  Clear filters
                </Link>
              </div>
            )}

            <Pagination basePath={basePath} filters={filters} totalPages={totalPages} />
          </div>
        </div>
      </section>
    </>
  );
}

export default function CategoryPage(props: PageProps) {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-15 lg:py-10 xl:px-0">
      <Suspense fallback={<CategoryPageSkeleton />}>
        <CategoryContent {...props} />
      </Suspense>
    </div>
  );
}