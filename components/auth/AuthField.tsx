// components/auth/AuthField.tsx
'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  labelAction?: React.ReactNode;
}

export default function AuthField({
  label,
  error,
  hint,
  icon: Icon,
  labelAction,
  type = 'text',
  className = '',
  ...props
}: Props) {
  const id = useId();
  const messageId = `${id}-message`;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-[#252525]">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="group relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#a3a3a3] transition-colors group-focus-within:text-[#252525]"
          />
        )}

        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={`block h-11 w-full rounded-xl border bg-[#fafafa] text-[15px] text-[#252525] outline-none transition placeholder:text-[#b0b0b0] hover:border-[#c8c8c8] focus:bg-white focus:ring-4 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${isPassword ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-[#e2e2e2] focus:border-[#fdde0b] focus:ring-[#fdde0b]/30'
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#8a8a8a] transition hover:bg-black/5 hover:text-[#252525] focus-visible:outline-2 focus-visible:outline-[#fdde0b]"
          >
            {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-1.5 text-xs text-[#8a8a8a]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
