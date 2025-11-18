/*
 * File dimodifikasi: app/dashboard/customer/catalog/catalog-client.tsx
 * Deskripsi: Menambah state management untuk AddToCartDialog.
 */
'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Category, ProductWithDetails } from '@/types/product';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CatalogGrid } from './catalog-grid';
import { processCategories } from '@/lib/utils';
import { AddToCartDialog } from './add-to-cart-dialog'; // <-- Impor dialog baru

interface CatalogClientProps {
  initialProducts: ProductWithDetails[];
  categories: Category[];
}

export function CatalogClient({
  initialProducts,
  categories,
}: CatalogClientProps) {
  // State untuk Search dan Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // --- STATE BARU UNTUK DIALOG ---
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithDetails | null>(null);
  // --- BATAS STATE BARU ---

  const processedCategories = processCategories(categories);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const categoryMatch =
        filterCategory === 'all' || product.category_id === filterCategory;
      return nameMatch && categoryMatch;
    });
  }, [initialProducts, searchTerm, filterCategory]);

  // --- HANDLER BARU UNTUK MEMBUKA DIALOG ---
  const handleAddToCartClick = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsCartDialogOpen(true);
  };
  // --- BATAS HANDLER BARU ---

  return (
    <>
      <div className="space-y-6">
        {/* BAR UNTUK FILTER, SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari nama produk..."
                className="pl-10 py-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {processedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tampilan Produk (Grid) */}
        <CatalogGrid
          products={filteredProducts}
          onAddToCart={handleAddToCartClick} // <-- Kirim handler ke grid
        />
      </div>

      {/* Render Dialog (tersembunyi by default) */}
      <AddToCartDialog
        isOpen={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        product={selectedProduct}
      />
    </>
  );
}