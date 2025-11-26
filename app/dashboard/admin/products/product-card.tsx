'use client';

import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Warehouse, Trash2, Package } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStockInfo = (variants: ProductWithDetails['product_variants']) => {
  if (variants.length === 0) {
    return { total: 0, needsRestock: false, range: 'Belum ada varian', variantCount: 0 };
  }
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  const needsRestock = variants.some((v) => v.stock < 10);
  const prices = variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const range = minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
      
  return { total, needsRestock, range, variantCount: variants.length };
};

interface ProductCardProps {
  product: ProductWithDetails;
  onEdit: (product: ProductWithDetails) => void;
  onDelete: (product: ProductWithDetails) => void;
  onManageVariants: (product: ProductWithDetails) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onManageVariants,
}: ProductCardProps) {
  const stockInfo = getStockInfo(product.product_variants);

  return (
    <Card className="group flex flex-col h-full bg-white rounded-2xl border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      
      {/* Image Area - Aspect Square like Customer */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.image_url || '/img/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Admin Action Button (Floating) */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm border border-gray-200"
              >
                <MoreVertical className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuLabel>Kelola Produk</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4 text-gray-500" /> Edit Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageVariants(product)} className="cursor-pointer">
                <Warehouse className="mr-2 h-4 w-4 text-gray-500" /> Kelola Varian & Stok
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Hapus Produk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Low Stock Badge Overlay */}
        {stockInfo.needsRestock && (
           <div className="absolute bottom-2 left-2">
              <Badge variant="destructive" className="shadow-sm px-2 py-0.5 text-[10px] bg-red-500 hover:bg-red-600 border-0">Stok Menipis</Badge>
           </div>
        )}
      </div>

      {/* Content Area */}
      <CardContent className="p-3 flex-1 flex flex-col gap-1.5">
        {/* Badge Kategori Cyan */}
        <div className="flex justify-between items-start gap-2">
           <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded-md truncate max-w-[100%]">
              {product.categories?.name || 'Uncategorized'}
           </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5em]" title={product.name}>
          {product.name}
        </h3>
        
        {/* Harga Hitam Bold */}
        <div className="mt-auto pt-1">
           <p className="font-bold text-gray-900 text-sm">{stockInfo.range}</p>
        </div>
      </CardContent>

      {/* Footer Info Stok - Style abu-abu minimalis */}
      <CardFooter className="px-3 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
         <div className="flex items-center gap-1.5" title="Total Stok">
            <Package className="h-3.5 w-3.5 text-gray-400" />
            <span>Total Stok: <strong className="text-gray-700">{stockInfo.total}</strong></span>
         </div>
         <div className="text-gray-400">{stockInfo.variantCount} Varian</div>
      </CardFooter>
    </Card>
  );
}