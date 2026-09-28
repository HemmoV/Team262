/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/format';

export default async function AdminProductenPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    include: { category: { select: { name: true } } },
  });

  return (
    <>
      <div className="admin-header-row">
        <h1 style={{ margin: 0 }}>Producten</h1>
        <Link href="/admin/producten/nieuw" className="btn btn-primary btn-sm">
          + Product toevoegen
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Nog geen producten.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Naam</th>
                <th>Categorie</th>
                <th>SKU</th>
                <th className="num">Prijs</th>
                <th className="num">Voorraad</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.imageUrl ? <img src={p.imageUrl} alt="" className="thumb" /> : <div className="thumb" />}</td>
                  <td>
                    <Link href={`/admin/producten/${p.id}`}>{p.name}</Link>
                    {p.featured && <span className="muted"> ★</span>}
                  </td>
                  <td className="muted">{p.category?.name ?? '—'}</td>
                  <td className="muted">{p.sku}</td>
                  <td className="num">{formatPrice(p.price)}</td>
                  <td className={`num ${p.stock === 0 ? 'stock-out' : p.stock <= 3 ? 'stock-low' : ''}`}>{p.stock}</td>
                  <td>{p.active ? <span className="state-on">Actief</span> : <span className="muted">Verborgen</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
