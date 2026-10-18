// app/categories/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import CategoryCard from '@/components/category/CategoryCard';
import { getCategoryTree } from '@/lib/categories';

const linkFocus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

const cardGrid =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5';

export const metadata: Metadata = {
  title: 'All categories | ProShop',
  description: 'Browse every product category at ProShop.',
  alternates: { canonical: '/categories' },
};

function CategoriesSkeleton() {
  return (
    <div className="motion-safe:animate-pulse" aria-busy="true" aria-label="Loading categories">
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="mt-10">
          <div className="h-7 w-48 rounded bg-neutral-200" />
          <div className={`mt-4 ${cardGrid}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-neutral-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

async function CategoriesContent() {
  const tree = await getCategoryTree();

  if (tree.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center text-neutral-500">
        No categories yet.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-12">
      {tree.map((top) => (
        <section key={top.slug} aria-labelledby={`cat-${top.slug}`}>
          <div className="relative mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2
              id={`cat-${top.slug}`}
              className="text-base font-bold uppercase tracking-wide sm:text-lg lg:text-xl"
            >
              {top.name}
            </h2>
            <span aria-hidden className="absolute -bottom-px left-0 h-[4px] w-12 rounded-full bg-yellow-400" />
            <Link
              href={`/category/${top.slug}`}
              className={`rounded text-sm font-medium text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline ${linkFocus}`}
            >
              View all
            </Link>
          </div>

          <ul className={cardGrid}>
            {(top.children.length > 0 ? top.children : [top]).map((c) => (
              <li key={c.slug} className="min-w-0">
                <CategoryCard name={c.name} image_url={c.image_url} href={`/category/${c.slug}`} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-15 lg:py-10 xl:px-0">
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
              Categories
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          All categories
        </h1>
        <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-yellow-400" />
      </header>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
