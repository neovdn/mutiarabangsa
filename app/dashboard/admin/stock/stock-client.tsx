'use client';

import { Suspense, useMemo, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Warehouse } from 'lucide-react';
import { StockTable } from './stock-table';
import { ProductVariant, Category } from '@/types/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VariantFormDialog } from './variant-form-dialog';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { deleteVariant } from './actions';
import { useToast } from '@/hooks/use-toast';

// Tipe data yang diterima dari server
export type VariantWithProduct = ProductVariant & {
  products: {
    id: string; // ID produk ditambahkan
    name: string;
    categories: {
      id: string; // ID kategori ditambahkan
      name: string;
    } | null;
  } | null;
};

// Tipe sederhana untuk dropdown produk
type SimpleProduct = {
  id: string;
  name: string;
};

interface StockClientProps {
  initialVariants: VariantWithProduct[];
  allProducts: SimpleProduct[];
  allCategories: Category[];
}

// Komponen internal untuk membaca searchParams
function StockClientContent({
  initialVariants,
  allProducts,
  allCategories,
}: StockClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // State untuk Filter
  // Ambil query pencarian dari URL (jika ada)
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || '',
  );
  const [filterCategory, setFilterCategory] = useState('all');

  // State untuk Dialog
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // State untuk Data yang Dipilih
  const [selectedVariant, setSelectedVariant] =
    useState<VariantWithProduct | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<VariantWithProduct | null>(null);

  // Logika Filter
  const filteredVariants = useMemo(() => {
    return initialVariants.filter((variant) => {
      const productName = variant.products?.name || '';
      const categoryName = variant.products?.categories?.name || '';
      const categoryId = variant.products?.categories?.id || '';
      const size = variant.size || '';
      const sku = variant.sku || '';

      const searchLower = searchTerm.toLowerCase();

      const searchMatch =
        productName.toLowerCase().includes(searchLower) ||
        categoryName.toLowerCase().includes(searchLower) ||
        size.toLowerCase().includes(searchLower) ||
        sku.toLowerCase().includes(searchLower);

      const categoryMatch =
        filterCategory === 'all' || categoryId === filterCategory;

      return searchMatch && categoryMatch;
    });
  }, [initialVariants, searchTerm, filterCategory]);

  // Handlers untuk membuka dialog
  const handleAddVariant = () => {
    setSelectedVariant(null);
    setIsVariantFormOpen(true);
  };

  const handleEditVariant = (variant: VariantWithProduct) => {
    setSelectedVariant(variant);
    setIsVariantFormOpen(true);
  };

  const handleAdjustStock = (variant: VariantWithProduct) => {
    setSelectedVariant(variant);
    setIsAdjustStockOpen(true);
  };

  const handleDeleteVariant = (variant: VariantWithProduct) => {
    setDeleteTarget(variant);
    setIsDeleteAlertOpen(true);
  };

  // Handler untuk aksi hapus
  const performDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteVariant(deleteTarget.id);
      if (result.success) {
        toast({ title: 'Berhasil', description: result.message });
        setDeleteTarget(null);
        setIsDeleteAlertOpen(false);
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
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Cari produk, ukuran, kategori, SKU..."
              className="pl-10 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Kategori */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {allCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tombol Aksi */}
        <Button onClick={handleAddVariant} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Varian Baru
        </Button>
      </div>

      {/* Tabel Stok */}
      <StockTable
        variants={filteredVariants}
        onEdit={handleEditVariant}
        onAdjustStock={handleAdjustStock}
        onDelete={handleDeleteVariant}
      />

      {/* --- RENDER SEMUA DIALOG --- */}

      {/* Dialog 1: Tambah / Edit Varian */}
      <VariantFormDialog
        isOpen={isVariantFormOpen}
        onOpenChange={setIsVariantFormOpen}
        // @ts-ignore - Tipe sudah sesuai, 'products' akan ada
        variant={selectedVariant}
        allProducts={allProducts}
      />

      {/* Dialog 2: Sesuaikan Stok */}
      <AdjustStockDialog
        isOpen={isAdjustStockOpen}
        onOpenChange={setIsAdjustStockOpen}
        // @ts-ignore - Tipe sudah sesuai, 'products' akan ada
        variant={selectedVariant}
      />

      {/* Dialog 3: Konfirmasi Hapus */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Varian{' '}
              <span className="font-bold">
                {deleteTarget?.products?.name} ({deleteTarget?.size})
              </span>{' '}
              akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={performDelete}
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

// Wrapper Suspense untuk useSearchParams
export function StockClient(props: StockClientProps) {
  return (
    <Suspense fallback={<div>Memuat filter...</div>}>
      <StockClientContent {...props} />
    </Suspense>
  );
}