import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact & service — Team262 Shop',
};

export default function ContactPage() {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1>Vragen over een product?</h1>
          <p>We helpen je graag bij het kiezen van de juiste producten voor de stalling van je auto.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="container">
          <div className="pillar-grid">
            <div className="pillar">
              <h3>Mail of bel ons</h3>
              <p>
                <a href={`mailto:${site.email}`} style={{ color: 'var(--gold-light)' }}>
                  {site.email}
                </a>
                {site.telefoon && (
                  <>
                    <br />
                    <a href={`tel:${site.telefoon.replace(/[^\d+]/g, '')}`} style={{ color: 'var(--gold-light)' }}>
                      {site.telefoon}
                    </a>
                  </>
                )}
              </p>
            </div>
            <div className="pillar">
              <h3>Bestellen & verzenden</h3>
              <p>
                Op werkdagen voor 15:00 besteld is doorgaans binnen 1–2 werkdagen in huis. Alle prijzen zijn inclusief 21%
                btw.
              </p>
            </div>
            <div className="pillar">
              <h3>Retourneren</h3>
              <p>
                Je hebt 14 dagen bedenktijd na ontvangst. Ophalen bij de showroom van Team262 kan op afspraak; zie{' '}
                <a href={`${site.hoofdsite}/over-ons`} style={{ color: 'var(--gold-light)' }}>
                  onze contactpagina
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
