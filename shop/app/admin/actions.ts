'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { checkPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/session';
import { ORDER_STATUSES, slugify } from '@/lib/format';

type FormState = { error: string } | null;

// ── Inloggen ─────────────────────────────────────────────────────────────────

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    return { error: 'Ongeldig wachtwoord' };
  }
  cookies().set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  redirect('/admin');
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect('/admin/login');
}

// ── Producten ────────────────────────────────────────────────────────────────

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

async function saveUpload(file: File) {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error('Alleen JPG, PNG, WEBP of GIF afbeeldingen zijn toegestaan');
  const dir = path.join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/products/${name}`;
}

function parseMoney(value: FormDataEntryValue | null) {
  const s = String(value ?? '').trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Ongeldig bedrag: ${value}`);
  return new Prisma.Decimal(n.toFixed(2));
}

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');

  try {
    const name = String(formData.get('name') ?? '').trim();
    if (!name) return { error: 'Naam is verplicht' };
    const price = parseMoney(formData.get('price'));
    if (!price) return { error: 'Prijs is verplicht' };

    let imageUrl = String(formData.get('imageUrl') ?? '').trim();
    const file = formData.get('image');
    if (file instanceof File && file.size > 0) imageUrl = await saveUpload(file);
    if (formData.get('removeImage') === 'on') imageUrl = '';

    const data = {
      name,
      slug: slugify(String(formData.get('slug') ?? '') || name),
      sku: String(formData.get('sku') ?? '').trim(),
      shortDescription: String(formData.get('shortDescription') ?? '').trim(),
      description: String(formData.get('description') ?? ''),
      price,
      compareAtPrice: parseMoney(formData.get('compareAtPrice')),
      stock: Math.max(0, Math.floor(Number(formData.get('stock') ?? 0)) || 0),
      active: formData.get('active') === 'on',
      featured: formData.get('featured') === 'on',
      imageUrl,
      categoryId: String(formData.get('categoryId') ?? '') || null,
    };

    if (id) {
      await prisma.product.update({ where: { id }, data });
    } else {
      await prisma.product.create({ data });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'Deze URL-naam (slug) is al in gebruik door een ander product' };
    }
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt' };
  }

  revalidatePath('/', 'layout');
  redirect('/admin/producten');
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/', 'layout');
  redirect('/admin/producten');
}

// ── Categorieën ──────────────────────────────────────────────────────────────

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Naam is verplicht' };

  const data = {
    name,
    slug: slugify(String(formData.get('slug') ?? '') || name),
    description: String(formData.get('description') ?? '').trim(),
    sortOrder: Math.floor(Number(formData.get('sortOrder') ?? 0)) || 0,
  };

  try {
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'Deze slug is al in gebruik' };
    }
    return { error: 'Opslaan mislukt' };
  }
  revalidatePath('/', 'layout');
  return { error: '' };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/', 'layout');
}

// ── Bestellingen ─────────────────────────────────────────────────────────────

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    // Bij annuleren de voorraad terugboeken (en weer afboeken bij heropenen)
    const wasCancelled = order.status === 'geannuleerd';
    const isCancelled = status === 'geannuleerd';
    if (wasCancelled !== isCancelled) {
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: isCancelled ? { increment: item.quantity } : { decrement: item.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath('/admin', 'layout');
}
