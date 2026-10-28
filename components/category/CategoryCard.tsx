// components/category/CategoryCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  name: string;
  image_url?: string | null;
  href: string;
}

export default function CategoryCard({ name, image_url, href }: Props) {
  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-slate-100 transition hover:shadow-md">
      <Link
        href={href}
        className="group flex h-full w-full flex-col overflow-hidden bg-slate-100 hover:shadow-md"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 300px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-bold">
              <span className="text-yellow-400">{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </Link>
      <p className="line-clamp-2 flex min-h-[3rem] items-center justify-center px-3 py-2 text-center text-xs font-semibold uppercase leading-4 tracking-[0.08em] text-neutral-800 transition group-hover:text-primary-500 sm:min-h-[3.5rem] sm:text-sm sm:leading-5">
        {name}
      </p>
    </div>
  );
}