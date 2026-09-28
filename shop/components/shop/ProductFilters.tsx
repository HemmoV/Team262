'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  categories: { slug: string; name: string }[];
  current: { categorie?: string; sort?: string; q?: string };
}

export default function ProductFilters({ categories, current }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? '');

  const update = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries({ ...current, ...patch }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    router.push(`/producten${qs ? `?${qs}` : ''}`);
  };

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <>
      <div className="chips">
        <button className={`chip${!current.categorie ? ' active' : ''}`} onClick={() => update({ categorie: '' })}>
          Alles
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            className={`chip${current.categorie === c.slug ? ' active' : ''}`}
            onClick={() => update({ categorie: c.slug })}
          >
            {c.name}
          </button>
        ))}
      </div>

      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q });
        }}
      >
        <div className="field">
          <label htmlFor="q">Zoeken</label>
          <input id="q" type="search" placeholder="Productnaam of artikelnummer" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sort">Sorteren</label>
          <select id="sort" value={current.sort ?? ''} onChange={(e) => update({ sort: e.target.value })}>
            <option value="">Uitgelicht eerst</option>
            <option value="name_asc">Naam A → Z</option>
            <option value="price_asc">Prijs: laag → hoog</option>
            <option value="price_desc">Prijs: hoog → laag</option>
            <option value="recent">Nieuwste</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm">
          Zoek
        </button>
        {hasFilters && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setQ('');
              router.push('/producten');
            }}
          >
            Wis filters
          </button>
        )}
      </form>
    </>
  );
}
