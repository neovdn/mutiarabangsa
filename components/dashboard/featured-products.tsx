'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface FeaturedProductsProps {
  products: ProductWithDetails[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Produk Pilihan</h2>
        <Link 
          href="/dashboard/customer/catalog" 
          className="text-[#E8207E] font-medium hover:text-[#E8207E]/80 flex items-center gap-1 text-sm"
        >
          Lihat Katalog
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const prices = product.product_variants.map(v => v.price);
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const stockTotal = product.product_variants.reduce((a, b) => a + b.stock, 0);

          return (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all border-gray-100">
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={product.image_url || '/img/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {stockTotal === 0 && (
                   <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Badge variant="destructive" className="font-bold">Habis</Badge>
                   </div>
                )}
              </div>

              <CardContent className="p-3">
                <div className="text-xs text-gray-500 mb-1 truncate">
                  {product.categories?.name || 'Umum'}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 h-10 leading-tight">
                  {product.name}
                </h3>
                <p className="font-bold text-cyan-600 text-sm">
                  {minPrice > 0 ? formatCurrency(minPrice) : 'Cek Harga'}
                </p>
              </CardContent>
              
              <CardFooter className="p-3 pt-0">
                 <Button 
                    size="sm" 
                    className="w-full text-xs h-8 bg-[#E8207E] text-white hover:bg-[#E8207E]/90 shadow-sm" // <-- Warna Pink Kustom
                    asChild
                 >
                    <Link href={`/dashboard/customer/catalog?search=${encodeURIComponent(product.name)}`}>
                       Detail
                    </Link>
                 </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}