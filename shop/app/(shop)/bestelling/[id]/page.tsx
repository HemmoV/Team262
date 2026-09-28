import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatOrderNumber, formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bedankt voor je bestelling — Team262 Shop', robots: { index: false } };

export default async function BestellingPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  return (
    <section>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="text-center" style={{ marginBottom: 40 }}>
          <div className="confirm-mark">✓</div>
          <span className="eyebrow">Bestelling {formatOrderNumber(order.number)}</span>
          <h1>Bedankt voor je bestelling!</h1>
          <p>
            We sturen de bevestiging en betaalinstructies naar <strong>{order.email}</strong>.
          </p>
        </div>

        <div className="panel">
          {order.items.map((i) => (
            <div key={i.id} className="summary-row">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span>{formatPrice(Number(i.price) * i.quantity)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Verzendkosten</span>
            <span>{Number(order.shippingCost) === 0 ? 'Gratis' : formatPrice(order.shippingCost)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Totaal</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="panel">
          <h2>Afleveradres</h2>
          <p style={{ margin: 0 }}>
            {order.firstName} {order.lastName}
            {order.company && <>, {order.company}</>}
            <br />
            {order.street} {order.houseNumber}
            <br />
            {order.postalCode} {order.city}
          </p>
        </div>

        <div className="text-center" style={{ marginTop: 36 }}>
          <Link href="/producten" className="btn btn-outline">
            Verder winkelen
          </Link>
        </div>
      </div>
    </section>
  );
}
