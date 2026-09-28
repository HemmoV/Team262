export function formatPrice(price: unknown) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('nl-NL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatOrderNumber(n: number) {
  return `T262-${String(10000 + n)}`;
}

export function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ORDER_STATUSES = ['nieuw', 'betaald', 'verzonden', 'afgerond', 'geannuleerd'] as const;
