'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { MoreHorizontal } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

// Helper dari file product-table.tsx
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getStockInfo = (variants: ProductWithDetails['product_variants']) => {
  if (variants.length === 0) {
    return { total: 0, needsRestock: false, range: 'Atur Varian' };
  }
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  const needsRestock = variants.some((v) => v.stock < 10);
  const prices = variants.map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  return { total, needsRestock, range };
};
// ---

interface ProductCardProps {
  product: ProductWithDetails;
  onEdit: (product: ProductWithDetails) => void;
  onDelete: (product: ProductWithDetails) => void;
  // onManageVariants: (product: ProductWithDetails) => void; // Untuk nanti
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const stockInfo = getStockInfo(product.product_variants);

  return (
    <Card className="flex flex-col h-full shadow-md transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        {/* Tombol Aksi di Pojok */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Aksi Produk</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(product)}>
                Edit Produk
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert('Fitur "Manage Variants" belum dibuat')}
              >
                Kelola Varian/Stok
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(product)} // <-- Panggil fungsi onDelete
              >
                Hapus Produk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Gambar Produk */}
        <AspectRatio ratio={1 / 1}>
          <Image
            src={product.image_url || '/img/placeholder.png'}
            alt={product.name}
            fill
            className="rounded-t-lg object-cover"
          />
        </AspectRatio>
      </CardHeader>

      {/* Konten (Nama, Kategori, Harga) */}
      {/* --- PENYESUAIAN PADDING & FONT --- */}
      <CardContent className="p-3 flex-1">
        {product.categories ? (
          <Badge variant="secondary" className="mb-2">
            {product.categories.name}
          </Badge>
        ) : (
          <div className="h-6 mb-2" /> // Placeholder agar tinggi sama
        )}
        <CardTitle
          className="text-base font-semibold leading-tight line-clamp-2" // <-- diubah dari text-lg
          title={product.name}
        >
          {product.name}
        </CardTitle>
        <p className="text-base font-bold text-cyan-600 mt-2">
          {stockInfo.range}
        </p>
      </CardContent>

      {/* Footer (Stok) */}
      <CardFooter className="p-3 pt-0">
        {/* --- PENYESUAIAN PADDING --- */}
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-500">
            Total Stok: {stockInfo.total}
          </span>
          {stockInfo.needsRestock && (
            <Badge variant="destructive">Stok Rendah</Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}