// components/checkout/CheckoutSteps.tsx
const STEPS = ['Shipping and Payment', 'Place an Order'];

export function CheckoutSteps({ current }: { current: 1 | 2 }) {
  return (
    <ol aria-label="Checkout progress" className="mt-4 flex items-center gap-3 sm:gap-5">
      {STEPS.map((label, idx) => {
        const n = idx + 1;
        const state = n === current ? 'active' : n < current ? 'done' : 'todo';
        const box =
          state === 'active'
            ? 'bg-[#fdde0b] text-[#252525]'
            : state === 'done'
              ? 'bg-[#fdde0b]/50 text-neutral-500'
              : 'bg-neutral-400 text-white';
        const text = state === 'active' ? 'text-[#252525]' : 'text-neutral-400';

        return (
          <li
            key={label}
            aria-current={state === 'active' ? 'step' : undefined}
            className="flex items-center gap-3 sm:gap-5"
          >
            {idx > 0 && <span aria-hidden="true" className="h-px w-10 bg-neutral-300 sm:w-20" />}
            <span className={`flex size-7 items-center justify-center text-sm font-bold ${box}`}>
              {n}
            </span>
            <span className={`text-sm font-semibold sm:text-base ${text}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}