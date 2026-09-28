import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatDate, formatOrderNumber, formatPrice, ORDER_STATUSES } from '@/lib/format';
import StatusBadge from '@/components/admin/StatusBadge';
import { updateOrderStatus } from '@/app/admin/actions';

export default async function BestellingDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
  if (!order) notFound();

  return (
    <>
      <nav className="breadcrumb">
        <Link href="/admin/bestellingen">← Alle bestellingen</Link>
      </nav>

      <div className="admin-header-row">
        <div>
          <h1 style={{ margin: 0 }}>{formatOrderNumber(order.number)}</h1>
          <span className="muted">{formatDate(order.createdAt)}</span>
        </div>
        <form action={updateOrderStatus} className="inline-form">
          <input type="hidden" name="id" value={order.id} />
          <StatusBadge status={order.status} />
          <select name="status" defaultValue={order.status} aria-label="Status">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">
            Wijzig status
          </button>
        </form>
      </div>

      <div className="checkout-grid">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="num">Aantal</th>
                <th className="num">Prijs</th>
                <th className="num">Totaal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.productId ? <Link href={`/admin/producten/${i.productId}`}>{i.name}</Link> : i.name}</td>
                  <td className="muted">{i.sku}</td>
                  <td className="num">{i.quantity}</td>
                  <td className="num">{formatPrice(i.price)}</td>
                  <td className="num">{formatPrice(Number(i.price) * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="num">Subtotaal</td>
                <td className="num">{formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="num">Verzendkosten</td>
                <td className="num">{formatPrice(order.shippingCost)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="num">Totaal incl. btw</td>
                <td className="num">{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="panel">
          <span className="eyebrow">Klant</span>
          <p>
            {order.firstName} {order.lastName}
            {order.company && (
              <>
                <br />
                {order.company}
              </>
            )}
            <br />
            <a href={`mailto:${order.email}`} style={{ color: 'var(--gold-light)' }}>
              {order.email}
            </a>
            {order.phone && (
              <>
                <br />
                <a href={`tel:${order.phone}`} style={{ color: 'var(--gold-light)' }}>
                  {order.phone}
                </a>
              </>
            )}
          </p>
          <span className="eyebrow">Afleveradres</span>
          <p>
            {order.street} {order.houseNumber}
            <br />
            {order.postalCode} {order.city}
            <br />
            {order.country}
          </p>
          {order.notes && (
            <>
              <span className="eyebrow">Opmerkingen</span>
              <p style={{ whiteSpace: 'pre-line' }}>{order.notes}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
