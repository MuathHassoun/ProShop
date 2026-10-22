// components/admin/StatusBadge.tsx
const tones: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  unpaid: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  refunded: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-50 text-red-700',
};

export default function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        tones[value] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {value}
    </span>
  );
}
