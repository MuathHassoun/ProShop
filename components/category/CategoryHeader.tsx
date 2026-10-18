// components/category/CategoryHeader.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/categories';

interface Props {
  name: string;
  description: string | null;
  imageUrl: string | null;
  total: number;
  trail: { name: string; slug: string }[];
  subcategories: Category[];
}

const linkFocus =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

export default function CategoryHeader({
  name,
  description,
  imageUrl,
  total,
  trail,
  subcategories,
}: Props) {
  return (
    <header className="rounded-2xl bg-slate-50 px-5 py-6 sm:px-8 sm:py-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
          <li>
            <Link href="/" className={`rounded hover:text-neutral-900 ${linkFocus}`}>
              Home
            </Link>
          </li>
          {trail.map((crumb) => (
            <li key={crumb.slug} className="flex items-center gap-2">
              <span aria-hidden className="text-neutral-300">
                /
              </span>
              <Link href={`/category/${crumb.slug}`} className={`rounded hover:text-neutral-900 ${linkFocus}`}>
                {crumb.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span aria-hidden className="text-neutral-300">
              /
            </span>
            <span aria-current="page" className="text-neutral-800">
              {name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
          <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-yellow-400" />
          {description && (
            <p className="mt-4 max-w-prose text-sm leading-6 text-neutral-600 sm:text-base">{description}</p>
          )}
          <p className="mt-3 text-sm text-neutral-500">
            {total} {total === 1 ? 'product' : 'products'}
          </p>
        </div>

        {imageUrl && (
          <div className="relative hidden h-36 w-52 shrink-0 overflow-hidden rounded-xl bg-white md:block">
            <Image src={imageUrl} alt="" fill sizes="208px" className="object-cover" />
          </div>
        )}
      </div>

      {subcategories.length > 0 && (
        <nav aria-label={`${name} subcategories`} className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/category/${sub.slug}`}
                  className={`inline-flex h-10 items-center gap-2 rounded-full bg-white py-1 pl-1.5 pr-4 text-sm font-medium shadow-sm transition hover:bg-yellow-400 ${linkFocus}`}
                >
                  <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    {sub.image_url ? (
                      <Image src={sub.image_url} alt="" fill sizes="28px" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs font-bold">
                        {sub.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}