'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStockInfo = (variants: ProductWithDetails['product_variants']) => {
  if (variants.length === 0) {
    return { isOutOfStock: true, range: 'Habis' };
  }

  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = total === 0;

  const prices = variants.map((v) => v.price).filter((v) => v > 0);
  if (prices.length === 0) {
    return { isOutOfStock: true, range: 'Cek Harga' };
  }

  const minPrice = Math.min(...prices);
  const range = formatCurrency(minPrice);

  return { isOutOfStock, range };
};

interface ProductCardProps {
  product: ProductWithDetails;
  onAddToCart: (product: ProductWithDetails) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const stockInfo = getStockInfo(product.product_variants);

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const reviewCount = product.reviews?.length || 0;

  // URL halaman detail produk
  const detailUrl = `/dashboard/customer/catalog/products/${product.id}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden group border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white">
      
      {/* Gambar dengan Link */}
      <Link href={detailUrl} className="block relative aspect-square bg-gray-50 overflow-hidden cursor-pointer">
        <Image
          src={product.image_url || '/img/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {stockInfo.isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
            <Badge variant="destructive" className="text-xs font-bold shadow-sm">
              Stok Habis
            </Badge>
          </div>
        )}
      </Link>

      {/* Konten Kartu */}
      <CardContent className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
           {product.categories?.name || 'Lainnya'}
        </div>
        
        {/* Judul dengan Link */}
        <Link href={detailUrl} className="block group-hover:text-[#E8207E] transition-colors">
          <h3 
            className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight min-h-[2.5em] mb-1"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Rating Display - Selalu Tampil agar seragam */}
        <Link href={detailUrl} className="flex items-center gap-1 mb-1 w-fit cursor-pointer hover:opacity-80">
          <Star 
            className={`h-3 w-3 ${reviewCount > 0 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
          />
          <span className="text-xs font-bold text-gray-700">
            {reviewCount > 0 ? averageRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-[10px] text-gray-400">
            ({reviewCount > 0 ? `${reviewCount} ulasan` : 'Belum ada ulasan'})
          </span>
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
           {product.description || 'Tidak ada deskripsi.'}
        </p>
        
        <div className="mt-auto">
           <p className="font-bold text-[#E8207E] text-sm">
             {stockInfo.range}
           </p>
        </div>
      </CardContent>

      {/* Footer Aksi */}
      <CardFooter className="p-3 pt-0">
        <Button
          size="sm"
          className="w-full h-8 text-xs bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-medium rounded-lg shadow-none"
          disabled={stockInfo.isOutOfStock}
          asChild={!stockInfo.isOutOfStock} // Render sebagai Link jika stok tersedia
        >
          {stockInfo.isOutOfStock ? (
            // Tampilan saat disabled (tetap Button biasa)
            <div className="flex items-center justify-center w-full h-full">
              <ShoppingCart className="h-3 w-3 mr-1.5" />
              Habis
            </div>
          ) : (
            // Tampilan saat aktif (menjadi Link ke detail)
            <Link href={detailUrl}>
              <ShoppingCart className="h-3 w-3 mr-1.5" />
              Beli
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}