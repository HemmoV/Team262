/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { FREE_SHIPPING_FROM } from '@/lib/shipping';
import { formatPrice } from '@/lib/format';
import { site } from '@/lib/site';

export default function Footer({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <img src="/img/logo-white.svg" alt={site.naam} />
            </div>
            <p>
              Alles om je auto in topconditie te stallen. Producten die wij als petrolheads zelf gebruiken voor onze eigen
              auto&apos;s. Gratis verzending vanaf {formatPrice(FREE_SHIPPING_FROM)}.
            </p>
          </div>
          <div>
            <h4>Categorieën</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/producten?categorie=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              {site.telefoon && (
                <li>
                  <a href={`tel:${site.telefoon.replace(/[^\d+]/g, '')}`}>{site.telefoon}</a>
                </li>
              )}
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <Link href="/contact">Bestellen & verzenden</Link>
              </li>
              <li>
                <a href={site.hoofdsite}>Ons auto-aanbod</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} {site.naam}. Alle rechten voorbehouden.
          </span>
          <span>Alle prijzen incl. 21% btw</span>
        </div>
      </div>
    </footer>
  );
}
