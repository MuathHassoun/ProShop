// components/product/Stars.tsx
import { Star, StarHalf } from 'lucide-react';

export default function Stars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'size-4' : 'size-5';
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const diff = value - i;
        if (diff >= 1) return <Star key={i} className={`${dim} fill-yellow-400 text-yellow-400`} />;
        if (diff >= 0.5) {
          return (
            <span key={i} className="relative inline-flex">
              <Star className={`${dim} text-neutral-300`} />
              <StarHalf className={`absolute inset-0 ${dim} fill-yellow-400 text-yellow-400`} />
            </span>
          );
        }
        return <Star key={i} className={`${dim} text-neutral-300`} />;
      })}
    </div>
  );
}