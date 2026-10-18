// components/product/ProductPageSkeleton.tsx
export default function ProductPageSkeleton() {
    return (
        <div className="motion-safe:animate-pulse" aria-busy="true" aria-label="Loading product">
        <div className="mb-5 h-5 w-48 rounded bg-neutral-100" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
            {/* Gallery */}
            <div className="flex w-full max-w-[780px] flex-col gap-3 lg:flex-row lg:gap-4">
            <div className="hidden w-[72px] shrink-0 flex-col gap-2 lg:flex">
                {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square w-full rounded-lg bg-neutral-100" />
                ))}
            </div>
            <div className="aspect-square w-full flex-1 rounded-2xl bg-neutral-100" />
            </div>

            {/* Buy box */}
            <div className="flex min-w-0 flex-col gap-6 lg:max-w-xl">
            <div className="flex flex-col gap-3">
                <div className="h-8 w-4/5 rounded bg-neutral-100" />
                <div className="h-9 w-32 rounded bg-neutral-100" />
                <div className="h-4 w-24 rounded bg-neutral-100" />
            </div>
            <div className="flex flex-col gap-3">
                <div className="h-4 w-28 rounded bg-neutral-100" />
                <div className="flex gap-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="size-9 rounded-full bg-neutral-100" />
                ))}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="h-12 w-32 rounded-lg bg-neutral-100" />
                <div className="hidden h-12 flex-1 rounded-lg bg-neutral-100 lg:block" />
            </div>
            <div className="flex flex-col gap-2 border-t border-neutral-200 pt-6">
                <div className="h-4 w-full rounded bg-neutral-100" />
                <div className="h-4 w-11/12 rounded bg-neutral-100" />
                <div className="h-4 w-2/3 rounded bg-neutral-100" />
            </div>
            </div>
        </div>
        </div>
    );
}