'use client';

import Link from 'next/link';
import { useCart } from '@/components/shop/CartProvider';
import ProductImage from '@/components/shop/ProductImage';
import { formatPrice } from '@/lib/format';
import { FREE_SHIPPING_FROM, shippingFor } from '@/lib/shipping';

export default function WinkelwagenPage() {
  const { items, subtotal, setQuantity, remove, ready } = useCart();
  const shipping = shippingFor(subtotal);
  const remaining = FREE_SHIPPING_FROM - subtotal;

  return (
    <>
      <div className="page-head">
        <div className="container">
          <span className="eyebrow">Shop</span>
          <h1>Winkelwagen</h1>
        </div>
      </div>

      <div className="page-body">
        <div className="container">
          {!ready ? null : items.length === 0 ? (
            <div className="empty-state">
              <p>Je winkelwagen is leeg.</p>
              <Link href="/producten" className="btn btn-primary btn-sm">
                Bekijk onze producten
              </Link>
            </div>
          ) : (
            <div className="checkout-grid">
              <ul className="cart-list">
                {items.map((item) => (
                  <li key={item.productId} className="cart-item">
                    <Link href={`/producten/${item.slug}`} className="cart-thumb">
                      <ProductImage src={item.imageUrl} alt={item.name} />
                    </Link>
                    <div className="cart-info">
                      <h3>
                        <Link href={`/producten/${item.slug}`}>{item.name}</Link>
                      </h3>
                      <p className="muted">{formatPrice(item.price)} per stuk</p>
                      <div className="cart-actions">
                        <div className="qty qty-sm">
                          <button onClick={() => setQuantity(item.productId, item.quantity - 1)} aria-label="Minder">
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            aria-label="Meer"
                          >
                            +
                          </button>
                        </div>
                        <button className="link-button" onClick={() => remove(item.productId)}>
                          Verwijderen
                        </button>
                      </div>
                    </div>
                    <div className="cart-line-total">{formatPrice(item.price * item.quantity)}</div>
                  </li>
                ))}
              </ul>

              <aside className="price-box">
                <div className="summary-row">
                  <span>Subtotaal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Verzendkosten</span>
                  <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Totaal</span>
                  <span>{formatPrice(subtotal + shipping)}</span>
                </div>
                <p className="summary-note">
                  Incl. 21% btw.
                  {remaining > 0 && <> Nog {formatPrice(remaining)} tot gratis verzending.</>}
                </p>
                <Link href="/afrekenen" className="btn btn-primary btn-block">
                  Afrekenen
                </Link>
                <Link href="/producten" className="btn btn-outline btn-block">
                  Verder winkelen
                </Link>
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
