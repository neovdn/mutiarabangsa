'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowLeft, Package, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AddToCartDialog } from '../../add-to-cart-dialog';
import { ProductWithDetails } from '@/types/product';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ProductDetailClientProps {
  product: ProductWithDetails;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

  // Perhitungan Rating
  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const prices = product.product_variants.map((v) => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock, 0);

  const priceDisplay = minPrice === maxPrice 
    ? formatCurrency(minPrice) 
    : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tombol Kembali (Kecil & Simpel) */}
      <Link 
        href="/dashboard/customer/catalog" 
        className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-[#E8207E] transition-colors mb-4"
      >
        <ArrowLeft className="h-3 w-3 mr-1" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === KOLOM KIRI (LEBAR 4/12): GAMBAR & AKSI === */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="overflow-hidden border-gray-200 shadow-sm rounded-xl">
            {/* Gambar Produk */}
            <div className="relative aspect-square bg-white">
              <Image
                src={product.image_url || '/img/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Bagian Aksi (Harga & Tombol) - Langsung dibawah gambar */}
            <div className="p-5 bg-white space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Harga Satuan</p>
                <h3 className="text-2xl font-bold text-[#E8207E]">{priceDisplay}</h3>
              </div>

              <Button
                className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-bold h-11 rounded-lg shadow-sm"
                onClick={() => setIsCartDialogOpen(true)}
                disabled={totalStock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {totalStock === 0 ? 'Stok Habis' : 'Tambah Keranjang'}
              </Button>

              {/* Info Tambahan Kecil */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5 justify-center py-1 bg-gray-50 rounded">
                  <Package className="h-3 w-3" />
                  <span>Stok: {totalStock}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1 bg-gray-50 rounded">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Garansi</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* === KOLOM KANAN (LEBAR 8/12): DETAIL & REVIEW === */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Container Informasi Produk */}
          <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
              {/* Judul Produk */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Meta Info: Kategori & Rating (Dibawah Judul) */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2.5 py-0.5 text-xs font-normal border-0">
                  <Tag className="h-3 w-3 mr-1" />
                  {product.categories?.name || 'Umum'}
                </Badge>
                
                <div className="h-4 w-px bg-gray-300"></div> {/* Divider Kecil */}
                
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "h-3.5 w-3.5", 
                          s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({reviews.length} ulasan)</span>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Deskripsi Produk</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi detail untuk produk ini.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Container Review */}
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Ulasan Pembeli
              </h3>

              {reviews.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">Belum ada ulasan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {review.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {review.profiles?.full_name || 'Pengguna'}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-3 w-3',
                              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-1 pl-8">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <AddToCartDialog
        isOpen={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        product={product}
      />
    </div>
  );
}