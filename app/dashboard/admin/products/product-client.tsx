'use client';

import { useState, useMemo, useTransition } from 'react';
import { Plus, List, Grid, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './product-table';
import { ProductFormDialog } from './product-form';
import { Category, ProductWithDetails } from '@/types/product';
import { ProductGrid } from './product-grid';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { useToast } from '@/hooks/use-toast';
import { deleteProduct } from './actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

interface ProductClientProps {
  initialProducts: ProductWithDetails[];
  categories: Category[];
}

export function ProductClient({
  initialProducts,
  categories,
}: ProductClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();
  // --- TAMBAHAN STATE UNTUK RESET KEY ---
  const [formKey, setFormKey] = useState(0);
  // -------------------------------------
  const { toast } = useToast();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryGroups = useMemo(() => groupCategories(categories), [categories]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filterCategory === 'all' || product.category_id === filterCategory;
      return nameMatch && categoryMatch;
    });
  }, [initialProducts, searchTerm, filterCategory]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    // Reset form dengan mengubah key
    setFormKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    // Reset form dengan mengubah key
    setFormKey((prev) => prev + 1);
    setIsFormOpen(true);
  };

  const handleManageVariants = (product: ProductWithDetails) => {
    router.push(
      `/dashboard/admin/stock?search=${encodeURIComponent(product.name)}&productName=${encodeURIComponent(product.name)}`
    );
  };

  const onFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;

    startTransition(async () => {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast({ title: 'Berhasil', description: result.message });
        setProductToDelete(null);
        router.refresh();
      } else {
        toast({ title: 'Gagal', description: result.message, variant: 'destructive' });
      }
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    setFilterCategory(filterCategory === categoryId ? 'all' : categoryId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --- TOP BAR: SEARCH & ADD BUTTON --- */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
         
         {/* Search Area */}
         <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Cari produk, SKU, atau kategori..."
              className="pl-12 h-11 text-sm border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-xl transition-all bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Actions Area */}
         <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0 h-11 items-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? 'bg-white text-cyan-500 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? 'bg-white text-cyan-500 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
                >
                  <List className="h-5 w-5" />
                </button>
            </div>

            {/* Add Button */}
            <Button 
                onClick={handleAddProduct} 
                className="flex-1 sm:flex-none bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl h-11 px-6 shadow-sm font-semibold text-sm"
            >
                <Plus className="mr-2 h-4 w-4" /> Tambah
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

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 w-full min-w-0">
            {/* Result Info */}
            <div className="mb-3 flex items-center justify-between px-1">
               <p className="text-xs text-gray-500 font-medium">
                 Menampilkan <span className="font-bold text-gray-900">{filteredProducts.length}</span> produk
               </p>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {viewMode === 'grid' ? (
                <ProductGrid
                    products={filteredProducts}
                    onEdit={handleEditProduct}
                    onDelete={setProductToDelete}
                    onManageVariants={handleManageVariants}
                />
                ) : (
                <ProductTable
                    products={filteredProducts}
                    onEdit={handleEditProduct}
                    onDelete={setProductToDelete}
                    onManageVariants={handleManageVariants}
                />
                )}
            </div>
        </div>
      </div>

      {/* --- DIALOGS --- */}
      <ProductFormDialog
        key={formKey} // <-- TAMBAHAN PENTING: Memaksa remount setiap kali key berubah
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        categories={categories}
        onFormSubmit={onFormSubmit}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus produk <strong>{productToDelete?.name}</strong> beserta semua variannya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? 'Menghapus...' : 'Hapus Permanen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}