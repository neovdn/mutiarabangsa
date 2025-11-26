'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Category, ProductWithDetails } from '@/types/product';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CatalogGrid } from './catalog-grid';
import { AddToCartDialog } from './add-to-cart-dialog';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CatalogClientProps {
  initialProducts: ProductWithDetails[];
  categories: Category[];
}

const groupCategories = (categories: Category[]) => {
  const groups = {
    'Seragam': [] as Category[],
    'Atribut': [] as Category[],
    'Perlengkapan Sekolah': [] as Category[],
  };

  categories.forEach((cat) => {
    const name = cat.name.toLowerCase();
    if (name.includes('seragam') || name.includes('celana') || name.includes('rok') || name.includes('kemeja') || name.includes('atasan') || name.includes('pramuka') || name.includes('olahraga')) {
      groups['Seragam'].push(cat);
    } else if (name.includes('dasi') || name.includes('topi') || name.includes('ikat pinggang') || name.includes('kaus kaki') || name.includes('sabuk')) {
      groups['Atribut'].push(cat);
    } else {
      groups['Perlengkapan Sekolah'].push(cat);
    }
  });

  return groups;
};

export function CatalogClient({
  initialProducts,
  categories,
}: CatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // State untuk Toggle Filter di Mobile
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);

  const categoryGroups = useMemo(() => groupCategories(categories), [categories]);

  useEffect(() => {
    const querySearch = searchParams.get('search');
    const queryCategory = searchParams.get('category');
    
    if (querySearch) setSearchTerm(querySearch);
    if (queryCategory) setFilterCategory(queryCategory);
  }, [searchParams]);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/dashboard/customer/catalog?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
  };

  const handleCategoryClick = (categoryId: string) => {
    const newVal = filterCategory === categoryId ? 'all' : categoryId;
    setFilterCategory(newVal);
    updateUrl('category', newVal);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    router.replace('/dashboard/customer/catalog');
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filterCategory === 'all' || product.category_id === filterCategory;
      return nameMatch && categoryMatch;
    });
  }, [initialProducts, searchTerm, filterCategory]);

  const handleAddToCartClick = (product: ProductWithDetails) => {
    setSelectedProduct(product);
    setIsCartDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        
        {/* 1. SEARCH BAR */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
           <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Cari produk seragam, atribut, atau perlengkapan..."
                className="pl-12 h-11 text-sm border-gray-200 focus:border-[#E8207E] focus:ring-[#E8207E] rounded-xl transition-all"
                value={searchTerm}
                onChange={handleSearchChange}
              />
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* 2. SIDEBAR FILTER (Sticky Desktop, Collapsible Mobile) */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 z-10">
            <Collapsible
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:block"
            >
              {/* Header Filter */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 lg:cursor-default">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#E8207E]" />
                  <h3 className="font-bold text-gray-800 text-sm">Kategori</h3>
                </div>
                
                <div className="flex items-center gap-2">
                   {(filterCategory !== 'all') && (
                      <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">
                        Reset
                      </button>
                   )}
                   
                   {/* Toggle Icon (Mobile Only) */}
                   <CollapsibleTrigger asChild className="lg:hidden">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isFilterOpen ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                   </CollapsibleTrigger>
                </div>
              </div>
              
              {/* Content: Always visible on Desktop, collapsible on Mobile */}
              <div className={cn("transition-all lg:block", isFilterOpen ? "block" : "hidden lg:block")}>
                {/* Flexible Height Logic */}
                <ScrollArea className="h-auto max-h-[50vh] lg:max-h-none lg:h-[calc(100vh-180px)] w-full transition-all">
                  <div className="p-2 pb-10">
                    <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                      {Object.entries(categoryGroups).map(([groupName, groupCats], idx) => (
                        <AccordionItem key={groupName} value={`item-${idx + 1}`} className="border-b-0 mb-1 last:mb-0">
                          <AccordionTrigger className="px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:no-underline data-[state=open]:text-[#E8207E]">
                            {groupName}
                          </AccordionTrigger>
                          <AccordionContent className="pt-1 pb-2">
                            <div className="flex flex-col gap-1 px-2">
                              {groupCats.length === 0 ? (
                                <span className="text-xs text-gray-400 italic px-2">Kategori kosong</span>
                              ) : (
                                groupCats.map((cat) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={cn(
                                      "text-left text-xs py-2 px-3 rounded-lg transition-all flex items-center gap-2 w-full",
                                      filterCategory === cat.id 
                                        ? "bg-[#E8207E]/10 text-[#E8207E] font-bold shadow-sm" 
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                  >
                                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", filterCategory === cat.id ? "bg-[#E8207E]" : "bg-gray-300")} />
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
            </Collapsible>
          </aside>

          {/* 3. MAIN CONTENT (KANAN) */}
          <div className="flex-1 w-full min-w-0">
            {/* Info Result */}
            <div className="mb-3 flex items-center justify-between px-1">
               <p className="text-xs text-gray-500 font-medium">
                 Menampilkan <span className="font-bold text-gray-900">{filteredProducts.length}</span> produk
               </p>
            </div>

            {/* Grid Produk */}
            <div className="min-h-[400px]">
               <CatalogGrid
                 products={filteredProducts}
                 onAddToCart={handleAddToCartClick}
               />
            </div>
          </div>
        </div>
      </div>

      <AddToCartDialog
        isOpen={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        product={selectedProduct}
      />
    </>
  );
}