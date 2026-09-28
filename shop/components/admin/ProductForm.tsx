'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { saveProduct } from '@/app/admin/actions';

interface Props {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    description: string;
    price: string;
    compareAtPrice: string;
    stock: number;
    active: boolean;
    featured: boolean;
    imageUrl: string;
    categoryId: string | null;
  };
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? 'Opslaan…' : 'Opslaan'}
    </button>
  );
}

export default function ProductForm({ categories, product }: Props) {
  const [state, action] = useFormState(saveProduct, null);

  return (
    <form action={action} className="product-form-grid">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="imageUrl" value={product?.imageUrl ?? ''} />

      <div className="panel">
        <div className="form-field">
          <label htmlFor="name">
            Naam <span className="required">*</span>
          </label>
          <input id="name" name="name" required defaultValue={product?.name} />
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="slug">URL-naam (leeg = automatisch)</label>
            <input id="slug" name="slug" defaultValue={product?.slug} />
          </div>
          <div className="form-field">
            <label htmlFor="sku">Artikelnummer (SKU)</label>
            <input id="sku" name="sku" defaultValue={product?.sku} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="shortDescription">Korte omschrijving</label>
          <input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription} />
        </div>
        <div className="form-field">
          <label htmlFor="description">Omschrijving (HTML toegestaan: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;…)</label>
          <textarea id="description" name="description" rows={12} defaultValue={product?.description} />
        </div>
      </div>

      <div>
        <div className="panel">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="price">
                Prijs incl. btw <span className="required">*</span>
              </label>
              <input id="price" name="price" required inputMode="decimal" defaultValue={product?.price} />
            </div>
            <div className="form-field">
              <label htmlFor="compareAtPrice">Van-prijs</label>
              <input id="compareAtPrice" name="compareAtPrice" inputMode="decimal" defaultValue={product?.compareAtPrice} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="stock">Voorraad</label>
            <input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} />
          </div>
          <div className="form-field">
            <label htmlFor="categoryId">Categorie</label>
            <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ''}>
              <option value="">— Geen —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="checkbox-field form-field">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
            Zichtbaar in de shop
          </label>
          <label className="checkbox-field form-field">
            <input type="checkbox" name="featured" defaultChecked={product?.featured} />
            Uitlichten op homepage
          </label>
        </div>

        <div className="panel">
          <div className="form-field">
            <label htmlFor="image">Productfoto</label>
            {product?.imageUrl && (
              <>
                <img src={product.imageUrl} alt="" className="image-preview" />
                <label className="checkbox-field" style={{ marginBottom: 10 }}>
                  <input type="checkbox" name="removeImage" /> Foto verwijderen
                </label>
              </>
            )}
            <input id="image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
          </div>
        </div>

        {state?.error && (
          <div className="flash flash-error" style={{ marginTop: 24 }}>
            {state.error}
          </div>
        )}

        <div className="inline-form" style={{ marginTop: 24 }}>
          <Submit />
          <Link href="/admin/producten" className="btn btn-outline">
            Annuleren
          </Link>
        </div>
      </div>
    </form>
  );
}
