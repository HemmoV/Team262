'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { saveCategory } from '@/app/admin/actions';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
      {pending ? '…' : label}
    </button>
  );
}

export default function CategoryForm({
  category,
}: {
  category?: { id: string; name: string; slug: string; description: string; sortOrder: number };
}) {
  const [state, action] = useFormState(saveCategory, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!category && state && !state.error) ref.current?.reset();
  }, [state, category]);

  return (
    <form ref={ref} action={action} className="category-row">
      {category && <input type="hidden" name="id" value={category.id} />}
      <input name="name" required placeholder="Naam" defaultValue={category?.name} aria-label="Naam" />
      <input name="slug" placeholder="URL-naam (auto)" defaultValue={category?.slug} aria-label="URL-naam" />
      <input name="description" placeholder="Omschrijving" defaultValue={category?.description} aria-label="Omschrijving" />
      <input name="sortOrder" type="number" title="Volgorde" defaultValue={category?.sortOrder ?? 0} aria-label="Volgorde" />
      <Submit label={category ? 'Opslaan' : 'Toevoegen'} />
      {state?.error && <p className="form-error">{state.error}</p>}
    </form>
  );
}
