// components/admin/fields.tsx
import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5 text-sm text-[#252525] placeholder:text-[#aaaaaa] focus:border-[#252525] focus:bg-white focus:outline-none disabled:opacity-60';

export const primaryButtonClass =
  'cursor-pointer rounded-lg bg-[#fdde0b] px-4 py-2 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5d200] disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButtonClass =
  'cursor-pointer rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm font-semibold text-[#252525] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-50';

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[#252525]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-[#888888]">{hint}</p>}
    </div>
  );
}

export function CheckboxField({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#252525]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[#252525]"
      />
      {label}
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);