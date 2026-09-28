'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from './CartProvider';
import { site } from '@/lib/site';

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="cart-icon" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}

function CartButton({ className }: { className: string }) {
  const { count, ready } = useCart();
  return (
    <Link href="/winkelwagen" className={`btn btn-primary btn-sm cart-link ${className}`} aria-label="Winkelwagen">
      <CartIcon />
      <span>Winkelwagen</span>
      {ready && count > 0 && <span className="cart-count">{count}</span>}
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo" onClick={close}>
          <img src="/img/logo-white.svg" alt={site.naam} />
          <span className="logo-tag">Shop</span>
        </Link>
        <nav className={`main-nav${open ? ' open' : ''}`}>
          <Link href="/" onClick={close} className={pathname === '/' ? 'active' : ''}>
            Home
          </Link>
          <Link href="/producten" onClick={close} className={pathname.startsWith('/producten') ? 'active' : ''}>
            Producten
          </Link>
          <Link href="/contact" onClick={close} className={pathname === '/contact' ? 'active' : ''}>
            Contact
          </Link>
          <a href={site.hoofdsite}>Auto-aanbod ↗</a>
          <CartButton className="" />
        </nav>
        <div className="header-actions">
          <CartButton className="cart-link-mobile" />
          <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
