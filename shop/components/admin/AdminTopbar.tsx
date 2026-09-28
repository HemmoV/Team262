'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/admin/actions';

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/bestellingen', label: 'Bestellingen' },
  { href: '/admin/producten', label: 'Producten' },
  { href: '/admin/categorieen', label: 'Categorieën' },
];

export default function AdminTopbar() {
  const pathname = usePathname();

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-left">
        <Link href="/admin" className="logo">
          <img src="/img/logo-white.svg" alt="Team262" />
          <span className="logo-tag">Shop</span>
        </Link>
        <nav className="admin-nav">
          {links.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={active ? 'active' : ''}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="admin-topbar-right">
        <a href="/" target="_blank">
          Bekijk shop ↗
        </a>
        <form action={logout}>
          <button type="submit" className="link-button">
            Uitloggen
          </button>
        </form>
      </div>
    </div>
  );
}
