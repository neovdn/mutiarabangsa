'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, ArrowLeft, Package, Truck, ShieldCheck, Tag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AddToCartDialog } from '../../add-to-cart-dialog';
import { ProductWithDetails } from '@/types/product';
import { ProductCard } from '../../product-card';

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
  relatedProducts: ProductWithDetails[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // Rating distribution untuk visual
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-8">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard/customer/catalog" className="hover:text-[#E8207E] transition-colors">
          Katalog
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/customer/catalog" className="hover:text-[#E8207E] transition-colors">
          {product.categories?.name || 'Produk'}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Product Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
              <Link
                href="/dashboard/customer/catalog"
                className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-[#E8207E] rounded-xl shadow-md border border-gray-100 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              
              {totalStock === 0 && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <Badge variant="destructive" className="text-base font-bold px-6 py-2 shadow-lg">
                    Stok Habis
                  </Badge>
                </div>
              )}

              <Image
                src={product.image_url || '/img/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            </div>

            {/* Thumbnail Gallery - jika ada multiple images (future feature) */}
            {/* Uncomment jika ada fitur multiple images */}
            {/* <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    selectedImageIndex === idx ? "border-[#E8207E]" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Image
                    src={product.image_url || '/img/placeholder.png'}
                    alt={`${product.name} ${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div> */}
          </div>
        </div>

        {/* Middle: Product Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Product Header */}
          <div>
            <Badge variant="secondary" className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
              <Tag className="h-3 w-3 mr-1" />
              {product.categories?.name || 'Umum'}
            </Badge>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={cn(
                        "h-5 w-5", 
                        s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-sm text-gray-600">{reviews.length} ulasan</span>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-sm text-gray-600">{totalStock} tersedia</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100">
              <p className="text-sm text-gray-600 mb-1">Harga Mulai Dari</p>
              <h2 className="text-4xl font-bold text-[#E8207E] mb-4">{priceDisplay}</h2>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl transition-all active:scale-[0.98]"
                  onClick={() => setIsCartDialogOpen(true)}
                  disabled={totalStock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {totalStock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
                </Button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-semibold text-gray-900">Stok Terjamin</p>
              <p className="text-[10px] text-gray-500 mt-1">{totalStock} unit</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-xs font-semibold text-gray-900">Pengiriman Cepat</p>
              <p className="text-[10px] text-gray-500 mt-1">1-3 hari</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-xs font-semibold text-gray-900">Garansi Kualitas</p>
              <p className="text-[10px] text-gray-500 mt-1">100% Original</p>
            </div>
          </div>

          {/* Product Description */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi Produk</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || 'Tidak ada deskripsi detail untuk produk ini.'}
              </p>
            </CardContent>
          </Card>

          {/* Variants Info */}
          {product.product_variants.length > 0 && (
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Varian Tersedia</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.product_variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        variant.stock > 0 
                          ? "border-gray-200 bg-white hover:border-[#E8207E] hover:shadow-md" 
                          : "border-gray-100 bg-gray-50 opacity-60"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900">{variant.size}</span>
                        <Badge 
                          variant={variant.stock > 0 ? "default" : "secondary"}
                          className={cn(
                            "text-[10px]",
                            variant.stock > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {variant.stock > 0 ? `Stok: ${variant.stock}` : 'Habis'}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-[#E8207E]">
                        {formatCurrency(variant.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ulasan Pembeli</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Ulasan</h3>
              <p className="text-sm text-gray-500">Jadilah yang pertama memberikan ulasan untuk produk ini!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Rating Summary */}
              <div className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "h-5 w-5", 
                          s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">dari {reviews.length} ulasan</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-xs font-medium text-gray-700">{rating}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {reviews.map((review) => (
                  <div key={review.id} className="p-5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                          {review.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {review.profiles?.full_name || 'Pengguna'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
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
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produk Lainnya</h2>
            <Link 
              href="/dashboard/customer/catalog" 
              className="text-sm text-[#E8207E] hover:text-[#E8207E]/80 font-semibold flex items-center gap-1 group"
            >
              Lihat Semua
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard 
                key={relatedProduct.id} 
                product={relatedProduct} 
                onAddToCart={() => {}} 
              />
            ))}
          </div>
        </div>
      )}

      <AddToCartDialog
        isOpen={isCartDialogOpen}
        onOpenChange={setIsCartDialogOpen}
        product={product}
      />
    </div>
  );
}