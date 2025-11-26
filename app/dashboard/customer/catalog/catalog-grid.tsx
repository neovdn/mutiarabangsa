'use client';

import { ProductWithDetails } from '@/types/product';
import { ProductCard } from './product-card';

interface CatalogGridProps {
  products: ProductWithDetails[];
  onAddToCart: (product: ProductWithDetails) => void;
}

export function CatalogGrid({ products, onAddToCart }: CatalogGridProps) {
  return (
    // Grid responsif: 2 kolom di HP, 3 di Tablet, 4 di Laptop, 5 di Desktop Besar
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Produk tidak ditemukan</h3>
          <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain atau reset filter kategori.</p>
        </div>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))
      )}
    </div>
  );
}