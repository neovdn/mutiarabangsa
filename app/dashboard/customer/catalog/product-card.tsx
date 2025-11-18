/*
 * File dimodifikasi: app/dashboard/customer/catalog/product-card.tsx
 * Deskripsi: Mengubah status stok menjadi "Tersedia/Habis" dan
 * tombol "Keranjang" untuk memicu dialog (via prop).
 */
'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Helper untuk format mata uang
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// --- LOGIKA HELPER DIMODIFIKASI ---
const getStockInfo = (variants: ProductWithDetails['product_variants']) => {
  if (variants.length === 0) {
    return {
      isOutOfStock: true,
      range: 'Tidak Tersedia',
    };
  }

  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = total === 0;

  const prices = variants.map((v) => v.price).filter((v) => v > 0);

  if (prices.length === 0) {
    return {
      isOutOfStock: true,
      range: 'Tidak Tersedia',
    };
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const range =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  return { isOutOfStock, range };
};
// --- BATAS MODIFIKASI ---

interface ProductCardProps {
  product: ProductWithDetails;
  onAddToCart: (product: ProductWithDetails) => void; // <-- Prop baru
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const stockInfo = getStockInfo(product.product_variants);

  return (
    <Card className="flex flex-col h-full shadow-md transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={1 / 1}>
          <Image
            src={product.image_url || '/img/placeholder.png'}
            alt={product.name}
            fill
            className="rounded-t-lg object-cover"
          />
        </AspectRatio>
      </CardHeader>

      <CardContent className="p-3 flex-1">
        {product.categories ? (
          <Badge variant="secondary" className="mb-2">
            {product.categories.name}
          </Badge>
        ) : (
          <div className="h-6 mb-2" />
        )}
        <CardTitle
          className="text-base font-semibold leading-tight line-clamp-2"
          title={product.name}
        >
          {product.name}
        </CardTitle>
        <p className="text-base font-bold text-cyan-600 mt-2">
          {stockInfo.range}
        </p>
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <div className="flex justify-between items-center w-full gap-2">
          {/* Tampilan Status Stok (Diganti) */}
          <div>
            {stockInfo.isOutOfStock ? (
              <Badge variant="destructive">Habis</Badge>
            ) : (
              <Badge variant="secondary">Tersedia</Badge>
            )}
          </div>

          {/* Tombol Aksi Customer (Diganti) */}
          <Button
            size="sm"
            disabled={stockInfo.isOutOfStock} // Disable jika stok habis
            onClick={() => onAddToCart(product)} // <-- Panggil prop
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Keranjang
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}