'use client';

import { Suspense, useMemo, useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter } from 'lucide-react';
import { StockTable } from './stock-table';
import { ProductVariant, Category } from '@/types/product';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VariantFormDialog } from './variant-form-dialog';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { deleteVariant } from './actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type VariantWithProduct = ProductVariant & {
  products: {
    id: string;
    name: string;
    categories: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type SimpleProduct = {
  id: string;
  name: string;
};

// Helper grouping kategori
const groupCategories = (categories: Category[]) => {
  const groups = {
    'Seragam': [] as Category[],
    'Atribut': [] as Category[],
    'Perlengkapan': [] as Category[],
  };

  categories.forEach((cat) => {
    const name = cat.name.toLowerCase();
    if (name.includes('seragam') || name.includes('celana') || name.includes('rok') || name.includes('kemeja') || name.includes('atasan') || name.includes('pramuka') || name.includes('olahraga')) {
      groups['Seragam'].push(cat);
    } else if (name.includes('dasi') || name.includes('topi') || name.includes('ikat pinggang') || name.includes('kaus kaki') || name.includes('sabuk')) {
      groups['Atribut'].push(cat);
    } else {
      groups['Perlengkapan'].push(cat);
    }
  });

  return groups;
};

interface StockClientProps {
  initialVariants: VariantWithProduct[];
  allProducts: SimpleProduct[];
  allCategories: Category[];
}

function StockClientContent({
  initialVariants,
  allProducts,
  allCategories,
}: StockClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Search State
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Filter State
  const [filterCategory, setFilterCategory] = useState('all');

  // Dialog States
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantWithProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VariantWithProduct | null>(null);

  const categoryGroups = useMemo(() => groupCategories(allCategories), [allCategories]);

  const filteredVariants = useMemo(() => {
    return initialVariants.filter((variant) => {
      const productName = variant.products?.name || '';
      const categoryId = variant.products?.categories?.id || '';
      const size = variant.size || '';
      const sku = variant.sku || '';

      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        productName.toLowerCase().includes(searchLower) ||
        size.toLowerCase().includes(searchLower) ||
        sku.toLowerCase().includes(searchLower);

      const categoryMatch =
        filterCategory === 'all' || categoryId === filterCategory;

      return searchMatch && categoryMatch;
    });
  }, [initialVariants, searchTerm, filterCategory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    const params = new URLSearchParams(searchParams.toString());
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    } else {
      params.delete('search');
    }
    // Hapus param productName jika user mengetik manual
    if (params.has('productName')) {
      params.delete('productName');
    }
    router.replace(`/dashboard/admin/stock?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    setFilterCategory(filterCategory === categoryId ? 'all' : categoryId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    router.replace('/dashboard/admin/stock');
  };

  // Actions Handlers
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
        toast({ title: 'Gagal', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --- TOOLBAR: SEARCH & ADD --- */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Cari stok berdasarkan produk, ukuran, atau SKU..."
            className="pl-12 h-11 text-sm border-gray-200 focus:border-cyan-600 focus:ring-cyan-600 rounded-xl transition-all bg-transparent"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={handleAddVariant} 
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl h-11 px-6 shadow-sm font-semibold text-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Varian
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* --- SIDEBAR FILTER (Sticky) --- */}
        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-cyan-600" /> Kategori
                </h3>
                {(filterCategory !== 'all') && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">
                    Reset
                  </button>
                )}
              </div>
              
              <ScrollArea className="h-[50vh] lg:h-[calc(100vh-280px)] w-full">
                <div className="p-2">
                  <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                    {Object.entries(categoryGroups).map(([groupName, groupCats], idx) => (
                      <AccordionItem key={groupName} value={`item-${idx + 1}`} className="border-b-0 mb-1">
                        <AccordionTrigger className="px-3 py-2 hover:bg-cyan-50 rounded-lg text-sm font-semibold text-gray-700 hover:no-underline data-[state=open]:text-cyan-600">
                          {groupName}
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-2">
                          <div className="flex flex-col gap-1 px-2">
                            {groupCats.length === 0 ? (
                              <span className="text-xs text-gray-400 italic px-2">Kosong</span>
                            ) : (
                              groupCats.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategoryClick(cat.id)}
                                  className={cn(
                                    "text-left text-xs py-2 px-3 rounded-lg transition-all flex items-center gap-2 w-full",
                                    filterCategory === cat.id 
                                      ? "bg-cyan-50 text-cyan-600 font-bold shadow-sm" 
                                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                  )}
                                >
                                  <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", filterCategory === cat.id ? "bg-cyan-600" : "bg-gray-300")} />
                                  {cat.name}
                                </button>
                              ))
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </ScrollArea>
            </div>
        </aside>

        {/* --- MAIN CONTENT (TABLE) --- */}
        <div className="flex-1 w-full min-w-0">
            {/* Result Info */}
            <div className="mb-3 flex items-center justify-between px-1">
               <p className="text-xs text-gray-500 font-medium">
                 Menampilkan <span className="font-bold text-gray-900">{filteredVariants.length}</span> varian stok
               </p>
            </div>

            {/* Table */}
            <div className="min-h-[400px]">
               <StockTable
                 variants={filteredVariants}
                 onEdit={handleEditVariant}
                 onAdjustStock={handleAdjustStock}
                 onDelete={handleDeleteVariant}
               />
            </div>
        </div>
      </div>

      {/* --- DIALOGS --- */}
      <VariantFormDialog
        isOpen={isVariantFormOpen}
        onOpenChange={setIsVariantFormOpen}
        // @ts-ignore
        variant={selectedVariant}
        allProducts={allProducts}
      />

      <AdjustStockDialog
        isOpen={isAdjustStockOpen}
        onOpenChange={setIsAdjustStockOpen}
        // @ts-ignore
        variant={selectedVariant}
      />

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Varian{' '}
              <span className="font-bold text-gray-900">
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function StockClient(props: StockClientProps) {
  return (
    <Suspense>
      <StockClientContent {...props} />
    </Suspense>
  );
}