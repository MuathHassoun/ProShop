// components/auth/AuthParts.tsx
import { AlertCircle, Loader2 } from 'lucide-react';

/** Primary yellow submit button with a built-in loading state. */
export function SubmitButton({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fdde0b] text-[15px] font-bold text-[#252525] shadow-[0_8px_18px_-8px_rgba(240,200,0,0.9)] transition hover:-translate-y-px hover:bg-[#f7d500] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#252525]"
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {loading ? loadingText : children}
    </button>
  );
}

/** Form-level error banner (server errors, network errors). */
export function FormAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

/** Horizontal divider with a centered label. */
export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-[#9a9a9a]">
      <span className="h-px flex-1 bg-[#e5e5e5]" />
      {children}
      <span className="h-px flex-1 bg-[#e5e5e5]" />
    </div>
  );
}
