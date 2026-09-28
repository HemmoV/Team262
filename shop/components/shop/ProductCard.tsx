import Link from 'next/link';
import ProductImage from './ProductImage';
import { formatPrice } from '@/lib/format';

export interface ProductCardData {
  slug: string;
  name: string;
  shortDescription: string;
  price: unknown;
  compareAtPrice: unknown;
  stock: number;
  imageUrl: string;
  category: { name: string } | null;
}

export function isOnSale(p: { price: unknown; compareAtPrice: unknown }) {
  return p.compareAtPrice != null && Number(p.compareAtPrice) > Number(p.price);
}

export function productBadge(p: { stock: number; price: unknown; compareAtPrice: unknown }) {
  if (p.stock <= 0) return { cls: 'badge-uitverkocht', label: 'Uitverkocht' };
  if (isOnSale(p)) return { cls: 'badge-aanbieding', label: 'Aanbieding' };
  if (p.stock <= 3) return { cls: 'badge-laatste', label: `Nog ${p.stock}` };
  return null;
}

// Zelfde opbouw als de autokaart op team262.nl (.car-card)
export default function ProductCard({ product }: { product: ProductCardData }) {
  const badge = productBadge(product);

  return (
    <Link href={`/producten/${product.slug}`} className="car-card">
      <div className="car-image">
        {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
        <ProductImage src={product.imageUrl} alt={product.name} />
      </div>
      <div className="car-body">
        <h3>{product.name}</h3>
        {product.category && <div className="car-sub">{product.category.name}</div>}
        <div className="car-meta">
          <span>{product.shortDescription}</span>
        </div>
        <div className="car-price">
          {formatPrice(product.price)}
          {isOnSale(product) && <span className="price-old">{formatPrice(product.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
}
