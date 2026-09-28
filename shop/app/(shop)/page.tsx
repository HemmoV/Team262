import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/shop/ProductCard';
import { formatPrice } from '@/lib/format';
import { FREE_SHIPPING_FROM } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { active: true } } } } },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-media hero-media-plain">
            <div className="hero-content">
              <span className="eyebrow">Team262 Shop</span>
              <h1>Stallen zonder zorgen</h1>
              <p className="lead">
                Van ademende autohoes tot slimme druppellader: alles om je auto maandenlang in perfecte staat te bewaren.
                Geselecteerd door petrolheads die hun eigen auto&apos;s er ook mee stallen.
              </p>
              <div className="hero-actions">
                <Link href="/producten" className="btn btn-primary">
                  Bekijk alle producten
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  Advies nodig?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pillars-section">
        <div className="container">
          <div className="pillar-grid">
            <div className="pillar">
              <h3>Wat we zelf gebruiken</h3>
              <p>Alleen producten waarmee we onze eigen auto&apos;s stallen. Geen gokwerk, maar spullen die zich hebben bewezen.</p>
            </div>
            <div className="pillar">
              <h3>Voor en door petrolheads</h3>
              <p>We weten wat een lange winterstalling met accu, banden en lak doet, en hoe je dat voorkomt.</p>
            </div>
            <div className="pillar">
              <h3>Snel in huis</h3>
              <p>Zorgvuldig verpakt en verzonden. Gratis verzending vanaf {formatPrice(FREE_SHIPPING_FROM)}.</p>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section-alt">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Assortiment</span>
                <h2>Categorieën</h2>
              </div>
              <Link href="/producten" className="btn btn-outline btn-sm">
                Alle producten →
              </Link>
            </div>
            <div className="pillar-grid">
              {categories.map((c) => (
                <Link key={c.id} href={`/producten?categorie=${c.slug}`} className="pillar">
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  <span className="pillar-count">
                    {c._count.products} product{c._count.products !== 1 ? 'en' : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Uitgelicht</span>
              <h2>Populair voor de stalling</h2>
            </div>
            <Link href="/producten" className="btn btn-outline btn-sm">
              Volledig assortiment →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="car-grid">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Er staan nog geen producten in de shop. Voeg ze toe via het beheerpaneel.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section-alt">
        <div className="container text-center">
          <span className="eyebrow">Twijfel je wat je nodig hebt?</span>
          <h2>Vraag het ons</h2>
          <p style={{ maxWidth: 560, margin: '0 auto 28px' }}>
            Welke hoes past bij jouw auto, en heb je een druppellader of een ontvochtiger nodig? Laat het ons weten, dan
            denken we graag mee.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Contact opnemen
          </Link>
        </div>
      </section>
    </>
  );
}
