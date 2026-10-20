// lib/pricing.ts
export const TAX_RATE = 0.15;
export const FREE_SHIPPING_OVER = 100;
export const FLAT_SHIPPING = 10;

export function computeTotals(itemsPrice: number) {
  const items = Number(itemsPrice.toFixed(2));
  const shippingPrice = items > FREE_SHIPPING_OVER || items === 0 ? 0 : FLAT_SHIPPING;
  const taxPrice = Number((items * TAX_RATE).toFixed(2));
  const totalPrice = Number((items + shippingPrice + taxPrice).toFixed(2));
  return { itemsPrice: items, shippingPrice, taxPrice, totalPrice };
}