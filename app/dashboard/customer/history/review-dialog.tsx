'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { OrderWithDetails } from '@/types/order';
import { submitReview, ReviewFormState } from './review-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithDetails | null;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-semibold rounded-lg h-11"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Mengirim...
        </span>
      ) : (
        'Kirim Rating & Review'
      )}
    </Button>
  );
}

export function ReviewDialog({ isOpen, onOpenChange, order }: ReviewDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const initialState: ReviewFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(submitReview, initialState);

  useEffect(() => {
    if (isOpen && order) {
      // Reset state saat dialog dibuka
      setSelectedProduct(null);
      setRating(0);
      setHoveredRating(0);
      setComment('');
    }
  }, [isOpen, order]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil!' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onOpenChange(false);
        router.refresh();
      }
    }
  }, [state, toast, onOpenChange, router]);

  if (!order) return null;

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setRating(0);
    setComment('');
  };

  const selectedItem = order.order_items.find(
    (item) => item.product_variants?.products?.id === selectedProduct
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Beri Rating & Review</DialogTitle>
          <DialogDescription>
            Bagikan pengalaman Anda untuk membantu pembeli lain
          </DialogDescription>
        </DialogHeader>

        {!selectedProduct ? (
          // Step 1: Pilih Produk
          <div className="space-y-4 py-4">
            <p className="text-sm font-semibold text-gray-700">
              Pilih produk yang ingin direview:
            </p>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {order.order_items.map((item) => {
                const product = item.product_variants?.products;
                if (!product) return null;

                // Mengambil status is_reviewed (casting any karena type mungkin belum diupdate di frontend types)
                const isReviewed = (item as any).is_reviewed;

                return (
                  <button
                    key={item.id}
                    disabled={isReviewed}
                    onClick={() => !isReviewed && handleProductSelect(product.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left group transition-all",
                      isReviewed 
                        ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed" 
                        : "border-gray-100 hover:border-[#E8207E] hover:bg-[#E8207E]/5"
                    )}
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-lg border bg-gray-50 overflow-hidden">
                      <Image
                        src={product.image_url || '/img/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#E8207E] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                            Size: {item.product_variants?.size} • Qty: {item.quantity}
                        </p>
                        {isReviewed && (
                           <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5 px-1.5 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Sudah Diulas
                           </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Step 2: Form Review
          <form action={formAction} className="space-y-6 py-4">
            <input type="hidden" name="order_id" value={order.id} />
            <input type="hidden" name="product_id" value={selectedProduct} />
            <input type="hidden" name="rating" value={rating} />

            {/* Produk yang dipilih */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 rounded-lg border bg-white overflow-hidden">
                  <Image
                    src={selectedItem?.product_variants?.products?.image_url || '/img/placeholder.png'}
                    alt={selectedItem?.product_variants?.products?.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-2">
                    {selectedItem?.product_variants?.products?.name}
                  </h4>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Size: {selectedItem?.product_variants?.size}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs text-gray-500 hover:text-[#E8207E]"
                >
                  Ganti Produk
                </Button>
              </div>
            </div>

            {/* Rating Bintang */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Berikan Rating:
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'h-10 w-10 transition-colors',
                        (hoveredRating >= star || rating >= star)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      )}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-semibold text-amber-500">
                    {rating} / 5
                  </span>
                )}
              </div>
              {rating === 0 && (
                <p className="text-xs text-red-500">* Rating wajib diisi</p>
              )}
            </div>

            {/* Komentar */}
            <div className="space-y-3">
              <Label htmlFor="comment" className="text-sm font-semibold text-gray-700">
                Tulis Review (Opsional):
              </Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] resize-none focus-visible:ring-[#E8207E] border-gray-200 rounded-xl"
              />
              <p className="text-xs text-gray-400">
                Tips: Jelaskan kualitas, kenyamanan, dan apakah sesuai ekspektasi
              </p>
            </div>

            {!state.success && state.message && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {state.message}
              </div>
            )}

            <SubmitButton disabled={rating === 0} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}