'use client';

import { ProductWithDetails } from '@/types/product';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: ProductWithDetails[];
  onEdit: (product: ProductWithDetails) => void;
  onDelete: (product: ProductWithDetails) => void;
  onManageVariants: (product: ProductWithDetails) => void; // <-- Prop ini tetap ada
}

export function ProductGrid({
  products,
  onEdit,
  onDelete,
  onManageVariants, // <-- Prop ini tetap ada
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {products.length === 0 ? (
        <p className="text-center text-gray-500 col-span-full py-10">
          Tidak ada produk yang cocok dengan pencarian Anda.
        </p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onManageVariants={onManageVariants} // <-- Pass prop
          />
        ))
      )}
    </div>
  );
}