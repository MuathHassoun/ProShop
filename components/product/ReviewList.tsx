// components/product/ReviewList.tsx
import Stars from './Stars';
import { formatDate } from '@/lib/format';
import type { Review } from '@/types';

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-neutral-500">No reviews yet.</p>;
  }

  const total = reviews.length;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-12">
      {/* Summary */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          <p className="text-5xl font-semibold leading-none tracking-tight">{average.toFixed(1)}</p>
          <div className="flex flex-col gap-1 pb-0.5">
            <Stars value={average} size="sm" />
            <p className="text-xs text-neutral-500">
              {total} {total === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>

        <dl className="flex flex-col gap-1.5">
          {counts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs text-neutral-500">
              <dt className="w-8 shrink-0">{star} star</dt>
              <dd className="flex min-w-0 flex-1 items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <span
                    className="block h-full rounded-full bg-yellow-400"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </span>
                <span className="w-6 text-right tabular-nums">{count}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* List */}
      <ul className="flex flex-col divide-y divide-neutral-200">
        {reviews.map((review) => (
          <li key={review.review_id} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{review.user_name}</p>
              <time dateTime={review.created_at} className="shrink-0 text-xs text-neutral-400">
                {formatDate(review.created_at)}
              </time>
            </div>
            <div className="mt-1.5">
              <Stars value={review.rating} size="sm" />
            </div>
            {review.title && <p className="mt-3 text-sm font-semibold">{review.title}</p>}
            {review.comment && (
              <p className="mt-1 max-w-prose text-sm leading-6 text-neutral-600">{review.comment}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}