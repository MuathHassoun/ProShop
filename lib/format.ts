// lib/format.ts
const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatPrice(value: number) {
  return priceFormatter.format(value);
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d);
}