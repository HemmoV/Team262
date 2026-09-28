import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/format';
import { FREE_SHIPPING_FROM } from '@/lib/shipping';
import ProductImage from '@/components/shop/ProductImage';
import ProductCard, { isOnSale, productBadge } from '@/components/shop/ProductCard';
import AddToCart from '@/components/shop/AddToCart';

export const dynamic = 'force-dynamic';

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product niet gevonden — Team262 Shop' };
  return { title: `${product.name} — Team262 Shop`, description: product.shortDescription };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const related = product.categoryId
    ? await prisma.product.findMany({
        where: { active: true, categoryId: product.categoryId, NOT: { id: product.id } },
        take: 3,
        include: { category: { select: { name: true } } },
      })
    : [];

  const badge = productBadge(product);
  const specs: [string, string][] = [];
  if (product.category) specs.push(['Categorie', product.category.name]);
  if (product.sku) specs.push(['Artikelnummer', product.sku]);
  specs.push([
    'Beschikbaarheid',
    product.stock > 0 ? (product.stock <= 5 ? `Nog ${product.stock} op voorraad` : 'Op voorraad') : 'Uitverkocht',
  ]);
  specs.push(['Verzending', `Gratis vanaf ${formatPrice(FREE_SHIPPING_FROM)}`]);

  return (
    <>
      <section>
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/producten">Producten</Link>
            {product.category && (
              <>
                {' / '}
                <Link href={`/producten?categorie=${product.category.slug}`}>{product.category.name}</Link>
              </>
            )}
          </nav>

          <div className="detail-grid">
            <div className="detail-media">
              {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
              <ProductImage src={product.imageUrl} alt={product.name} />
            </div>

            <div className="price-box">
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>{product.name}</h1>
              {product.shortDescription && <p>{product.shortDescription}</p>}
              <div className="price">
                {formatPrice(product.price)}
                {isOnSale(product) && <span className="price-old">{formatPrice(product.compareAtPrice)}</span>}
              </div>
              <div className="detail-price-note">incl. 21% btw</div>

              <table className="spec-table">
                <tbody>
                  {specs.map(([label, value]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <AddToCart
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  imageUrl: product.imageUrl,
                  stock: product.stock,
                }}
              />
            </div>
          </div>

          {product.description && (
            <div className="detail-body" style={{ marginTop: 56 }}>
              <span className="eyebrow">Omschrijving</span>
              <div className="car-description" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-alt">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Ook interessant</span>
                <h2>Meer uit {product.category?.name ?? 'deze categorie'}</h2>
              </div>
            </div>
            <div className="car-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
