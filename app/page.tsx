// app/page.tsx
import { Suspense } from 'react';
import Advertising from '@/components/product/Advertising';
import CategoryCarousel from '@/components/category/CategoryCarousel';
import ProductCarousel from '@/components/product/ProductCarousel';
import { getDiscountedProducts, getProducts, getTopRatedProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';

const HOME_CATEGORIES_LIMIT = 7;
const HOME_PRODUCTS_LIMIT = 15;
const HOME_TOP_RATE_PRODUCTS = 7;

const categoriesGrid =
  'mx-auto grid max-w-[1500px] grid-cols-1 gap-2 px-4 sm:grid-cols-1 sm:gap-3 sm:px-15 md:grid-cols-4 md:px-15 lg:grid-cols-4 xl:px-0';
const productsGrid =
  'mx-auto grid max-w-[1500px] grid-cols-1 gap-2 px-4 sm:grid-cols-1 sm:gap-3 sm:px-15 md:px-15 lg:grid-cols-4 xl:grid-cols-4 xl:px-0';

interface SectionProps {
  id: string;
  title: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function Section({ id, title, align = 'left', action, className = '', children }: SectionProps) {
  const centered = align === 'center';

  return (
    <section aria-labelledby={id} className={`py-4 sm:py-6 ${className}`}>
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

          {action ? (
            <div className={centered ? 'absolute right-0 top-0' : ''}>{action}</div>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function AdvertisingFallback() {
  return <div className="min-h-[300px] w-full animate-pulse bg-neutral-200 md:min-h-[400px]" />;
}

function GridFallback({
  id,
  title,
  count,
  className,
  aspect,
  align,
  sectionClassName,
}: {
  id: string;
  title: string;
  count: number;
  className: string;
  aspect: string;
  align?: 'left' | 'center';
  sectionClassName?: string;
}) {
  return (
    <Section id={id} title={title} align={align} className={sectionClassName}>
      <div className={className}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${aspect} animate-pulse rounded-2xl bg-neutral-200`} />
        ))}
      </div>
    </Section>
  );
}

async function HomeAdvertising() {
  const featured = await getDiscountedProducts(5);
  if (!featured.length) return null;
  return <Advertising products={featured} />;
}

async function HomeCategories() {
  const categories = await getCategories('leaf', HOME_CATEGORIES_LIMIT + 1);
  if (!categories.length) return null;

  return (
    <CategoryCarousel
      categories={categories.slice(0, HOME_CATEGORIES_LIMIT)}
      seeMoreHref={categories.length > HOME_CATEGORIES_LIMIT ? '/categories' : undefined}
    />
  );
}

async function HomeProducts() {
  const products = await getProducts(HOME_PRODUCTS_LIMIT + 1);
  if (!products.length) return null;

  return (
    <ProductCarousel
      id="products-heading"
      title="Featured products"
      products={products.slice(0, HOME_PRODUCTS_LIMIT)}
      seeMoreHref={products.length > HOME_PRODUCTS_LIMIT ? '/products' : undefined}
      align="center"
      className="bg-slate-50"
    />
  );
}

async function TopRatedProducts() {
  const products = await getTopRatedProducts(HOME_TOP_RATE_PRODUCTS + 1);
  if (!products.length) return null;

  return (
    <ProductCarousel
      id="top-rated-heading"
      title="Top rated products"
      products={products.slice(0, HOME_TOP_RATE_PRODUCTS)}
      seeMoreHref={products.length > HOME_TOP_RATE_PRODUCTS ? '/products?sort=top-rated' : undefined}
    />
  );
}

export default function Home() {
  return (
    <main className="flex flex-col pb-12">
      <Suspense fallback={<AdvertisingFallback />}>
        <HomeAdvertising />
      </Suspense>

      <Suspense
        fallback={
          <GridFallback
            id="categories-heading"
            title="Featured categories"
            count={6}
            className={categoriesGrid}
            aspect="aspect-square"
          />
        }
      >
        <HomeCategories />
      </Suspense>

      <Suspense
        fallback={
          <GridFallback
            id="products-heading"
            title="Featured products"
            count={5}
            className={productsGrid}
            aspect="aspect-[3/4]"
            align="center"
            sectionClassName="bg-slate-50"
          />
        }
      >
        <HomeProducts />
      </Suspense>

      <Suspense
        fallback={
          <GridFallback
            id="top-rated-heading"
            title="Top rated products"
            count={5}
            className={productsGrid}
            aspect="aspect-[3/4]"
          />
        }
      >
        <TopRatedProducts />
      </Suspense>
    </main>
  );
}