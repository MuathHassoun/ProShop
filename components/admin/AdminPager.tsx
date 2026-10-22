// components/admin/AdminPager.tsx
import Link from 'next/link';

interface Props {
  basePath: string;
  params: Record<string, string>;
  page: number;
  total: number;
  pageSize: number;
}

export default function AdminPager({ basePath, params, page, total, pageSize }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const linkClass =
    'rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-sm font-medium text-[#252525] hover:bg-[#f5f5f5]';
  const disabledClass = 'rounded-lg border border-[#eeeeee] px-3 py-1.5 text-sm text-[#bbbbbb]';

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-[#777777]">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={linkClass}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className={linkClass}>
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </div>
  );
}
