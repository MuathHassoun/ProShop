// components/category/CategoryPageSkeleton.tsx
export default function CategoryPageSkeleton() {
    return (
      <div className="motion-safe:animate-pulse" aria-busy="true" aria-label="Loading category">
        {/* Header */}
        <div className="rounded-2xl bg-slate-50 px-5 py-6 sm:px-8 sm:py-8">
          <div className="h-4 w-48 rounded bg-neutral-200" />
          <div className="mt-5 h-10 w-64 rounded bg-neutral-200" />
          <div className="mt-4 h-4 w-full max-w-md rounded bg-neutral-200" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-28 rounded-full bg-neutral-200" />
            ))}
          </div>
        </div>
  
        {/* Products */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <div className="hidden h-[520px] rounded-2xl border border-neutral-200 lg:block" />
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="h-5 w-40 rounded bg-neutral-100" />
              <div className="h-10 w-40 rounded-lg bg-neutral-100" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-[3/4] rounded-2xl bg-neutral-100 ${i > 0 && i < 2 ? 'hidden sm:block' : ''} ${
                    i >= 2 ? 'hidden sm:block' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }