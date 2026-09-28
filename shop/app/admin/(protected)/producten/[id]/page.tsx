import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';
import ConfirmButton from '@/components/admin/ConfirmButton';
import { deleteProduct } from '@/app/admin/actions';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <div className="admin-header-row">
        <h1 style={{ margin: 0 }}>{product.name}</h1>
        <div className="inline-form">
          <a href={`/producten/${product.slug}`} target="_blank" className="btn btn-outline btn-sm">
            Bekijk in shop ↗
          </a>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmButton message={`"${product.name}" definitief verwijderen?`}>Verwijderen</ConfirmButton>
          </form>
        </div>
      </div>
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price.toFixed(2),
          compareAtPrice: product.compareAtPrice?.toFixed(2) ?? '',
          stock: product.stock,
          active: product.active,
          featured: product.featured,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
        }}
      />
    </>
  );
}
