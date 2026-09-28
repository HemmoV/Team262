// Verzendkosten (incl. BTW). Aan te passen via environment variabelen.
export const SHIPPING_COST = Number(process.env.NEXT_PUBLIC_SHIPPING_COST ?? '6.95');
export const FREE_SHIPPING_FROM = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_FROM ?? '75');

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
}
