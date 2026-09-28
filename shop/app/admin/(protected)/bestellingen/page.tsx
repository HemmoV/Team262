import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatOrderNumber, formatPrice, ORDER_STATUSES } from '@/lib/format';
import StatusBadge from '@/components/admin/StatusBadge';

export default async function BestellingenPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = (ORDER_STATUSES as readonly string[]).includes(searchParams.status ?? '') ? searchParams.status : undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
    take: 200,
  });

  return (
    <>
      <div className="admin-header-row">
        <h1 style={{ margin: 0 }}>Bestellingen</h1>
      </div>

      <div className="chips">
        <Link href="/admin/bestellingen" className={`chip${!status ? ' active' : ''}`}>
          Alle
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/bestellingen?status=${s}`} className={`chip${status === s ? ' active' : ''}`}>
            {s}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Geen bestellingen gevonden.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nummer</th>
                <th>Datum</th>
                <th>Klant</th>
                <th className="num">Regels</th>
                <th className="num">Totaal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/bestellingen/${o.id}`}>{formatOrderNumber(o.number)}</Link>
                  </td>
                  <td className="muted">{formatDate(o.createdAt)}</td>
                  <td>
                    {o.firstName} {o.lastName}
                    <div className="muted">{o.email}</div>
                  </td>
                  <td className="num">{o._count.items}</td>
                  <td className="num">{formatPrice(o.total)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
