'use client';

import { ProductWithDetails } from '@/types/product';
import { ProductCard } from './product-card';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: ProductWithDetails[];
  onEdit: (product: ProductWithDetails) => void;
  onDelete: (product: ProductWithDetails) => void;
  onManageVariants: (product: ProductWithDetails) => void;
}

export function ProductGrid({
  products,
  onEdit,
  onDelete,
  onManageVariants,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200 w-full">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
             <Package className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Produk tidak ditemukan</h3>
          <p className="text-gray-500 text-sm mt-1">Coba ubah filter kategori atau kata kunci pencarian.</p>
        </div>
    );
  }

  return (
    // Grid responsif: sama dengan customer (2 di HP, up to 5 di Desktop besar)
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageVariants={onManageVariants}
        />
      ))}
    </div>
  );
}