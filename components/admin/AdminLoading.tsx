// components/admin/AdminLoading.tsx
export default function AdminLoading() {
    return (
        <div role="status" aria-busy="true" aria-label="Loading" className="space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-[#f1f1f1]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#f1f1f1]" />
        </div>
    );
}