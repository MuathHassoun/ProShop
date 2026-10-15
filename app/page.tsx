// app/page.tsx
import { Suspense } from 'react';
import Advertising from '@/components/product/Advertising';
import CategoryCard from '@/components/product/CategoryCard';
import ProductCard from '@/components/product/ProductCard';
import { getFeaturedProduct, getProducts, getTopRatedProducts } from '@/lib/products';
import { getCategories } from '@/lib/categories';

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
  const product = await getFeaturedProduct();
  if (!product) return null;
  return <Advertising product={product} />;
}

async function HomeCategories() {
  const categories = await getCategories();
  if (!categories.length) return null;

  return (
    <Section id="categories-heading" title="Featured categories">
      <div className={categoriesGrid}>
        {categories.map((c) => (
          <CategoryCard key={c.slug} name={c.name} image_url={c.image_url} href={`/category/${c.slug}`} />
        ))}
      </div>
    </Section>
  );
}

async function HomeProducts() {
  const products = await getProducts();
  if (!products.length) return null;

  return (
    <Section id="products-heading" title="Featured products" align="center" className="bg-slate-50">
      <div className={productsGrid}>
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </Section>
  );
}

async function TopRatedProducts() {
  const products = await getTopRatedProducts();
  if (!products.length) return null;

  return (
    <Section id="top-rated-heading" title="Top rated products">
      <div className={productsGrid}>
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </Section>
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