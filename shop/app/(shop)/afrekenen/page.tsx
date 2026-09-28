'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { useCart } from '@/components/shop/CartProvider';
import { formatPrice } from '@/lib/format';
import { shippingFor } from '@/lib/shipping';
import { placeOrder, type CheckoutInput } from './actions';

function Field({
  name,
  label,
  required,
  type = 'text',
  autoComplete,
  full,
}: {
  name: keyof CheckoutInput['customer'];
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  full?: boolean;
}) {
  return (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input id={name} name={name} type={type} required={required} autoComplete={autoComplete} />
    </div>
  );
}

export default function AfrekenenPage() {
  const router = useRouter();
  const { items, subtotal, clear, ready } = useCart();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const shipping = shippingFor(subtotal);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as unknown as CheckoutInput['customer'];
    const result = await placeOrder({
      customer: data,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (result.ok) {
      clear();
      router.push(`/bestelling/${result.orderId}`);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <span className="eyebrow">Shop</span>
          <h1>Afrekenen</h1>
        </div>
      </div>

      <div className="page-body">
        <div className="container">
          {ready && items.length === 0 ? (
            <div className="empty-state">
              <p>Je winkelwagen is leeg.</p>
              <Link href="/producten" className="btn btn-primary btn-sm">
                Bekijk onze producten
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="checkout-grid">
              <div>
                <div className="panel">
                  <h2>Je gegevens</h2>
                  <div className="form-grid">
                    <Field name="firstName" label="Voornaam" required autoComplete="given-name" />
                    <Field name="lastName" label="Achternaam" required autoComplete="family-name" />
                    <Field name="company" label="Bedrijfsnaam" autoComplete="organization" full />
                    <Field name="email" label="E-mailadres" type="email" required autoComplete="email" />
                    <Field name="phone" label="Telefoonnummer" type="tel" autoComplete="tel" />
                  </div>
                </div>

                <div className="panel">
                  <h2>Afleveradres</h2>
                  <div className="form-grid">
                    <Field name="street" label="Straat" required autoComplete="address-line1" />
                    <Field name="houseNumber" label="Huisnummer" required />
                    <Field name="postalCode" label="Postcode" required autoComplete="postal-code" />
                    <Field name="city" label="Plaats" required autoComplete="address-level2" />
                    <div className="form-field full">
                      <label htmlFor="notes">Opmerkingen</label>
                      <textarea id="notes" name="notes" rows={3} />
                    </div>
                  </div>
                </div>
              </div>

              <aside className="price-box">
                <h2 style={{ fontSize: '1.3rem' }}>Overzicht</h2>
                {items.map((i) => (
                  <div key={i.productId} className="summary-row">
                    <span>
                      {i.quantity}× {i.name}
                    </span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="summary-row">
                  <span>Verzendkosten</span>
                  <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Totaal</span>
                  <span>{formatPrice(subtotal + shipping)}</span>
                </div>
                <p className="summary-note">
                  Incl. 21% btw. Na het plaatsen van je bestelling ontvang je een bevestiging met de betaalinstructies.
                </p>

                {error && <div className="flash flash-error">{error}</div>}

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !ready}>
                  {submitting ? 'Bezig…' : 'Bestelling plaatsen'}
                </button>
                <Link href="/winkelwagen" className="btn btn-outline btn-block">
                  Terug naar winkelwagen
                </Link>
              </aside>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
