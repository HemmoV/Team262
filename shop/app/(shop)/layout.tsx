import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';
import { CartProvider } from '@/components/shop/CartProvider';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { slug: true, name: true },
  });

  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer categories={categories} />
    </CartProvider>
  );
}
