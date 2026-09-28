'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './CartProvider';

interface Props {
  product: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
  };
}

export default function AddToCart({ product }: Props) {
  const { add, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.productId === product.productId)?.quantity ?? 0;
  const available = Math.max(product.stock - inCart, 0);

  if (product.stock <= 0) {
    return (
      <button type="button" className="btn btn-outline btn-block" disabled>
        Tijdelijk uitverkocht
      </button>
    );
  }

  return (
    <div>
      <div className="buy-row">
        <div className="qty">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Minder">
            −
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(Math.max(available, 1), q + 1))}
            aria-label="Meer"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={available <= 0}
          onClick={() => {
            add(product, quantity);
            setAdded(true);
            setQuantity(1);
          }}
        >
          {available <= 0 ? 'Maximum in winkelwagen' : 'In winkelwagen'}
        </button>
      </div>
      {added && (
        <div className="added-note">
          <span>✓ Toegevoegd aan je winkelwagen</span>
          <Link href="/winkelwagen">Bekijk →</Link>
        </div>
      )}
    </div>
  );
}
