import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function NieuwProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } });
  return (
    <>
      <div className="admin-header-row">
        <h1 style={{ margin: 0 }}>Product toevoegen</h1>
      </div>
      <ProductForm categories={categories} />
    </>
  );
}
