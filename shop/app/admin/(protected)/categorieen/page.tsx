import { prisma } from '@/lib/prisma';
import CategoryForm from '@/components/admin/CategoryForm';
import ConfirmButton from '@/components/admin/ConfirmButton';
import { deleteCategory } from '@/app/admin/actions';

export default async function CategorieenPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <div className="admin-header-row">
        <h1 style={{ margin: 0 }}>Categorieën</h1>
      </div>

      <div className="panel" style={{ marginBottom: 32 }}>
        <h2 className="admin-section-title">Nieuwe categorie</h2>
        <CategoryForm />
      </div>

      {categories.length > 0 && (
        <div className="panel" style={{ padding: 0 }}>
          {categories.map((c) => (
            <div key={c.id} className="category-item">
              <CategoryForm category={c} />
              <div className="category-meta">
                <span>
                  {c._count.products} product{c._count.products !== 1 ? 'en' : ''}
                </span>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Categorie "${c.name}" verwijderen? De producten blijven bestaan, zonder categorie.`}>
                    Verwijderen
                  </ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
