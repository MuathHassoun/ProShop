// components/product/ReviewsSkeleton.tsx
export default function ReviewsSkeleton() {
    return (
      <div
        className="grid min-h-64 gap-8 motion-safe:animate-pulse md:grid-cols-[240px_minmax(0,1fr)] md:gap-12"
        aria-busy="true"
        aria-label="Loading reviews"
      >
        <div className="flex flex-col gap-3">
          <div className="h-12 w-32 rounded bg-neutral-100" />
          <div className="h-3 w-full rounded bg-neutral-100" />
          <div className="h-3 w-5/6 rounded bg-neutral-100" />
          <div className="h-3 w-2/3 rounded bg-neutral-100" />
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-28 rounded bg-neutral-100" />
              <div className="h-3 w-24 rounded bg-neutral-100" />
              <div className="h-3 w-full max-w-prose rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }