'use client';

import { useState, useMemo, useTransition } from 'react';
import { Plus, List, Grid, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './product-table';
import { ProductFormDialog } from './product-form';
import { Category, ProductWithDetails } from '@/types/product';
import { ProductGrid } from './product-grid'; // <-- Impor komponen grid baru
import { Input } from '@/components/ui/input'; // <-- Ganti SearchBar dengan Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // <-- Impor Select untuk filter
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; // <-- Impor Alert Dialog
import { useToast } from '@/hooks/use-toast';
import { deleteProduct } from './actions'; // <-- Impor server action
import { useRouter } from 'next/navigation';

interface ProductClientProps {
  initialProducts: ProductWithDetails[];
  categories: Category[];
}

export function ProductClient({
  initialProducts,
  categories,
}: ProductClientProps) {
  // State untuk form (Edit/Create)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithDetails | null>(null);

  // State untuk Delete Dialog
  const [productToDelete, setProductToDelete] =
    useState<ProductWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // State untuk Search dan Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // State untuk ganti view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Default ke grid

  // Logika untuk memfilter produk
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

  // Handler untuk membuka dialog
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  // Handler untuk menutup dialog form
  const onFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
    // Kita tidak perlu fetch ulang, `revalidatePath` di server action
    // akan memicu Next.js untuk me-render ulang `page.tsx`
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteConfirm = () => {
    if (!productToDelete) return;

    startTransition(async () => {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast({
          title: 'Berhasil',
          description: result.message,
        });
        setProductToDelete(null);
        // Refresh data di sisi server
        router.refresh();
      } else {
        toast({
          title: 'Gagal',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* BAR UNTUK FILTER, SEARCH, DAN AKSI */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Cari produk..."
              className="pl-10 py-3" // Sesuaikan padding
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Kategori */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tombol Aksi (Ganti View & Tambah) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="w-full sm:w-auto"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="w-full sm:w-auto"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleAddProduct}
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Tampilan Produk (Grid atau List) */}
      <div>
        {viewMode === 'grid' ? (
          <ProductGrid
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={setProductToDelete} // Buka dialog konfirmasi
          />
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={setProductToDelete} // Buka dialog konfirmasi
          />
        )}
      </div>

      {/* Dialog Form (Create/Edit) */}
      <ProductFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        categories={categories}
        onFormSubmit={onFormSubmit}
      />

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk
              secara permanen beserta semua varian terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}