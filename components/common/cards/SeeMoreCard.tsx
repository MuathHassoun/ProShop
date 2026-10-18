// components/product/SeeMoreCard.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  href: string;
  label?: string;
  tinted?: boolean;
}

export default function SeeMoreCard({ href, label = 'See more', tinted = false }: Props) {
  return (
    <Link
      href={href}
      className={`group flex h-full min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl text-neutral-800 transition hover:shadow-md${
        tinted ? 'bg-slate-100' : 'bg-white shadow-sm'
      }`}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-yellow-400 transition-transform group-hover:translate-x-1">
        <ArrowRight className="size-6" />
      </span>
      <span className="text-sm font-medium uppercase tracking-[0.1em] sm:text-base">{label}</span>
    </Link>
  );
}