import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate, formatOrderNumber, formatPrice } from '@/lib/format';
import StatusBadge from '@/components/admin/StatusBadge';

export default async function DashboardPage() {
  const [newOrders, productCount, lowStock, revenue, recent] = await Promise.all([
    prisma.order.count({ where: { status: 'nieuw' } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.findMany({ where: { active: true, stock: { lte: 3 } }, orderBy: { stock: 'asc' }, take: 8 }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'geannuleerd' } } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  const tiles = [
    { label: 'Nieuwe bestellingen', value: String(newOrders), href: '/admin/bestellingen?status=nieuw' },
    { label: 'Actieve producten', value: String(productCount), href: '/admin/producten' },
    { label: 'Omzet (excl. geannuleerd)', value: formatPrice(revenue._sum.total ?? 0), href: '/admin/bestellingen' },
  ];

  return (
    <>
      <div className="admin-header-row">
        <h1 style={{ margin: 0 }}>Dashboard</h1>
      </div>

      <div className="stat-grid">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="stat">
            <div className="stat-label">{t.label}</div>
            <div className="stat-value">{t.value}</div>
          </Link>
        ))}
      </div>

      <div className="admin-columns">
        <div>
          <h2>Recente bestellingen</h2>
          {recent.length === 0 ? (
            <div className="empty-state">
              <p>Nog geen bestellingen.</p>
            </div>
          ) : (
            <table className="admin-table">
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/bestellingen/${o.id}`}>{formatOrderNumber(o.number)}</Link>
                      <div className="muted">
                        {o.firstName} {o.lastName} · {formatDate(o.createdAt)}
                      </div>
                    </td>
                    <td className="num">{formatPrice(o.total)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2>Lage voorraad (≤ 3)</h2>
          {lowStock.length === 0 ? (
            <div className="empty-state">
              <p>Alles ruim op voorraad.</p>
            </div>
          ) : (
            <table className="admin-table">
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/producten/${p.id}`}>{p.name}</Link>
                    </td>
                    <td className={`num ${p.stock === 0 ? 'stock-out' : 'stock-low'}`}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
