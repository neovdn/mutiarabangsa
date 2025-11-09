'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './product-table';
import { ProductFormDialog } from './product-form';
import { Category, ProductWithDetails } from '@/types/product';
import SearchBar from '@/components/SearchBar';

interface ProductClientProps {
  initialProducts: ProductWithDetails[];
  categories: Category[];
}

export function ProductClient({
  initialProducts,
  categories,
}: ProductClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithDetails | null>(null);

  // Fungsi untuk membuka dialog "Tambah Produk"
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  // Fungsi untuk membuka dialog "Edit Produk"
  const handleEditProduct = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  // Callback setelah form di-submit
  const onFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    // Kita tidak perlu fetch ulang, `revalidatePath` di server action akan memicu
    // Next.js untuk me-render ulang `page.tsx` dan memberikan data baru.
    // Jika tidak menggunakan revalidate, kita perlu fetch ulang di sini.
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Tabel Produk */}
      <ProductTable
        products={products}
        onEdit={handleEditProduct}
        // Kita akan tambahkan onManageVariants dan onDelete nanti
      />

      {/* Dialog Form (Create/Edit) */}
      <ProductFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        categories={categories}
        onFormSubmit={onFormSubmit}
      />
    </div>
  );
}