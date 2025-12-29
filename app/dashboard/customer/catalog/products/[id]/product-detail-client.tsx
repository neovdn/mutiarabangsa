'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AddToCartDialog } from '../../add-to-cart-dialog';
import { ProductWithDetails } from '@/types/product';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface ProductDetailClientProps {
  product: ProductWithDetails;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

  // Hitung rata-rata rating
  const reviews = product.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Rating breakdown (berapa review dengan rating 1-5)
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const prices = product.product_variants.map((v) => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <>
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-gray-600 hover:text-[#E8207E] mb-4"
        >
          <Link href="/dashboard/customer/catalog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Gambar & Info Dasar */}
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-gray-100 shadow-sm">
            <div className="relative aspect-square bg-gray-50">
              <Image
                src={product.image_url || '/img/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </Card>

          {/* Deskripsi Produk */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Deskripsi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'Tidak ada deskripsi untuk produk ini.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: Detail & Reviews */}
        <div className="space-y-6">
          {/* Info Produk */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {product.categories?.name || 'Lainnya'}
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              </div>

              {/* Rating Summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({reviews.length} ulasan)
                  </span>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-gray-500 mb-2">Harga Mulai Dari:</p>
                <p className="text-3xl font-bold text-[#E8207E]">
                  {formatCurrency(minPrice)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Stok Tersedia:</span> {totalStock} pcs
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tersedia dalam {product.product_variants.length} varian ukuran
                </p>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-bold rounded-xl h-12"
                onClick={() => setIsCartDialogOpen(true)}
                disabled={totalStock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {totalStock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </Button>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                Ulasan Pembeli
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    Belum ada ulasan untuk produk ini.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Jadilah yang pertama memberikan review!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-5 w-5',
                              star <= Math.round(averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        Dari {reviews.length} ulasan
                      </p>
                    </div>

                    <div className="space-y-2">
                      {ratingBreakdown.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-xs font-medium">{star}</span>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm text-gray-900">
                                {review.profiles?.full_name || 'Anonymous'}
                              </p>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">
                                {new Date(review.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    'h-3 w-3',
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-gray-200 text-gray-200'
                                  )}
                                />
                              ))}
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
    </>
  );
}