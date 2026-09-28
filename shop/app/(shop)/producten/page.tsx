import Link from 'next/link';
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilters from '@/components/shop/ProductFilters';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Producten — Team262 Shop',
  description: 'Alle producten voor de stalling van je auto.',
};

interface SearchParams {
  categorie?: string;
  sort?: string;
  q?: string;
}

export default async function ProductenPage({ searchParams }: { searchParams: SearchParams }) {
  const where: Prisma.ProductWhereInput = { active: true };
  if (searchParams.categorie) where.category = { slug: searchParams.categorie };
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { shortDescription: { contains: searchParams.q, mode: 'insensitive' } },
      { sku: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ featured: 'desc' }, { name: 'asc' }];
  if (searchParams.sort === 'name_asc') orderBy = [{ name: 'asc' }];
  if (searchParams.sort === 'price_asc') orderBy = [{ price: 'asc' }];
  if (searchParams.sort === 'price_desc') orderBy = [{ price: 'desc' }];
  if (searchParams.sort === 'recent') orderBy = [{ createdAt: 'desc' }];

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy, include: { category: { select: { name: true } } } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { slug: true, name: true, description: true } }),
  ]);

  const activeCategory = categories.find((c) => c.slug === searchParams.categorie);

  return (
    <>
      <div className="page-head">
        <div className="container">
          <span className="eyebrow">Shop</span>
          <h1>{activeCategory?.name ?? 'Alle producten'}</h1>
          <p>
            {activeCategory?.description ?? 'Alles om je auto in topconditie te stallen.'}{' '}
            {products.length} product{products.length !== 1 ? 'en' : ''}.
          </p>
        </div>
      </div>

      <div className="page-body">
        <div className="container">
          <ProductFilters categories={categories} current={searchParams} />

          {products.length === 0 ? (
            <div className="empty-state">
              <p>Geen producten gevonden. Probeer een andere categorie of zoekterm.</p>
              <Link href="/producten" className="btn btn-outline btn-sm">
                Alle filters wissen
              </Link>
            </div>
          ) : (
            <div className="car-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
