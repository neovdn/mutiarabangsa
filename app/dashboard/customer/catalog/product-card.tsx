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
import { ShoppingCart } from 'lucide-react'; // <-- Import Ikon Keranjang
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

// Helper untuk info stok dan harga (disesuaikan untuk customer)
const getStockInfo = (variants: ProductWithDetails['product_variants']) => {
  if (variants.length === 0) {
    return {
      total: 0,
      isOutOfStock: true,
      needsRestock: false,
      range: 'Tidak Tersedia',
    };
  }
  
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = total === 0;
  // Hanya tampilkan "Stok Rendah" jika tidak habis
  const needsRestock = !isOutOfStock && variants.some((v) => v.stock < 10);
  
  const prices = variants.map((v) => v.price).filter(v => v > 0);

  if (prices.length === 0) {
     return { 
       total: 0, 
       isOutOfStock: true, 
       needsRestock: false, 
       range: 'Tidak Tersedia' 
     };
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const range =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
      
  return { total, isOutOfStock, needsRestock, range };
};
// ---

interface ProductCardProps {
  product: ProductWithDetails;
  // Tidak ada props admin (onEdit, onDelete, dll)
}

export function ProductCard({ product }: ProductCardProps) {
  const stockInfo = getStockInfo(product.product_variants);

  const handleAddToCart = () => {
    // TODO: Implementasi logika Add to Cart
    // Untuk sekarang, kita buat placeholder
    alert(`Fitur "Tambah ke Keranjang" untuk ${product.name} segera hadir!`);
  };

  return (
    <Card className="flex flex-col h-full shadow-md transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        {/* Hapus DropdownMenu (tombol ...) admin */}

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
      <CardContent className="p-3 flex-1">
        {product.categories ? (
          <Badge variant="secondary" className="mb-2">
            {product.categories.name}
          </Badge>
        ) : (
          <div className="h-6 mb-2" /> // Placeholder agar tinggi sama
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

      {/* Footer (Stok & Tombol Keranjang) */}
      <CardFooter className="p-3 pt-0">
        <div className="flex justify-between items-center w-full gap-2">
          {/* Tampilan Status Stok */}
          <div>
            {stockInfo.isOutOfStock ? (
              <Badge variant="destructive">Stok Habis</Badge>
            ) : stockInfo.needsRestock ? (
              <Badge variant="destructive">Stok Rendah</Badge>
            ) : (
              <span className="text-sm text-gray-500">Stok Tersedia</span>
            )}
          </div>
          
          {/* Tombol Aksi Customer */}
          <Button
            size="sm"
            disabled={stockInfo.isOutOfStock} // Disable jika stok habis
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Keranjang
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}