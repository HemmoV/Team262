'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { shippingFor } from '@/lib/shipping';

export interface CheckoutInput {
  customer: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    phone: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    notes: string;
  };
  items: { productId: string; quantity: number }[];
}

export type CheckoutResult = { ok: true; orderId: string } | { ok: false; error: string };

class CheckoutError extends Error {}

const FIELDS: (keyof CheckoutInput['customer'])[] = [
  'firstName',
  'lastName',
  'company',
  'email',
  'phone',
  'street',
  'houseNumber',
  'postalCode',
  'city',
  'notes',
];

const REQUIRED: (keyof CheckoutInput['customer'])[] = [
  'firstName',
  'lastName',
  'email',
  'street',
  'houseNumber',
  'postalCode',
  'city',
];

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  // Alleen bekende velden overnemen, zodat de client geen status/totaal kan meesturen
  const c = Object.fromEntries(
    FIELDS.map((k) => [k, String(input.customer?.[k] ?? '').trim().slice(0, k === 'notes' ? 2000 : 200)]),
  ) as CheckoutInput['customer'];

  for (const field of REQUIRED) {
    if (!c[field]) return { ok: false, error: 'Vul alle verplichte velden in.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
    return { ok: false, error: 'Vul een geldig e-mailadres in.' };
  }

  // Samenvoegen en valideren van regels
  const quantities = new Map<string, number>();
  for (const item of input.items ?? []) {
    const qty = Math.floor(Number(item.quantity));
    if (!item.productId || !Number.isFinite(qty) || qty <= 0) continue;
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + qty);
  }
  if (quantities.size === 0) return { ok: false, error: 'Uw winkelwagen is leeg.' };

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: Array.from(quantities.keys()) }, active: true },
      });

      const lines = Array.from(quantities.entries()).map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        if (!product) throw new CheckoutError('Een product in uw winkelwagen is niet meer beschikbaar.');
        return { product, quantity };
      });

      // Voorraad atomair afboeken; faalt als er onvoldoende voorraad is
      for (const { product, quantity } of lines) {
        const res = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (res.count === 0) {
          throw new CheckoutError(
            `Onvoldoende voorraad voor "${product.name}" (nog ${product.stock} beschikbaar). Pas uw winkelwagen aan.`,
          );
        }
      }

      const subtotal = lines.reduce(
        (sum, { product, quantity }) => sum.add(product.price.mul(quantity)),
        new Prisma.Decimal(0),
      );
      const shipping = new Prisma.Decimal(shippingFor(subtotal.toNumber()));

      return tx.order.create({
        data: {
          ...c,
          subtotal,
          shippingCost: shipping,
          total: subtotal.add(shipping),
          items: {
            create: lines.map(({ product, quantity }) => ({
              productId: product.id,
              name: product.name,
              sku: product.sku,
              price: product.price,
              quantity,
            })),
          },
        },
      });
    });

    return { ok: true, orderId: order.id };
  } catch (e) {
    if (e instanceof CheckoutError) return { ok: false, error: e.message };
    console.error('Bestelling mislukt', e);
    return { ok: false, error: 'Er ging iets mis bij het plaatsen van de bestelling. Probeer het opnieuw.' };
  }
}
