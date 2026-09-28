import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="login-shell">
      <div className="text-center">
        <span className="eyebrow">404</span>
        <h1>Pagina niet gevonden</h1>
        <p>Deze pagina bestaat niet (meer).</p>
        <Link href="/producten" className="btn btn-primary">
          Naar alle producten
        </Link>
      </div>
    </main>
  );
}
