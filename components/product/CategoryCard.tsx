// components/product/CategoryCard.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  name: string;
  image_url?: string | null;
  href: string;
}

export default function CategoryCard({ name, image_url, href }: Props) {
  return (
    <Link
      href={href}
      className="group flex h-full w-full flex-col items-center gap-1 sm:gap-1.5"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 transition group-hover:shadow-md">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
            className="object-contain p-1.5 mix-blend-multiply transition-transform duration-300 group-hover:scale-105 sm:p-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-black sm:text-4xl">
            <span className="text-yellow-400">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <p className="line-clamp-2 h-9 w-full px-1 py-2 text-center text-sm font-medium uppercase leading-[18px] tracking-[0.1em] text-neutral-800 transition group-hover:text-primary-500 sm:h-11 sm:text-base sm:leading-[22px]">
        {name}
      </p>
    </Link>
  );
}