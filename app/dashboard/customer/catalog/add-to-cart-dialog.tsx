'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { ProductWithDetails, ProductVariant } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { addItemToCart, CartFormState } from '../cart/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AddToCartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithDetails | null;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending || disabled}
      className="bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-semibold rounded-lg" // Update Warna
    >
      {pending ? 'Menambahkan...' : 'Tambah ke Keranjang'}
    </Button>
  );
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function AddToCartDialog({
  isOpen,
  onOpenChange,
  product,
}: AddToCartDialogProps) {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const initialState: CartFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(addItemToCart, initialState);

  React.useEffect(() => {
    if (isOpen && product) {
      if (product.product_variants.length === 1) {
        setSelectedVariant(product.product_variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setQuantity(1);
      formRef.current?.reset();
    }
  }, [isOpen, product]);

  React.useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onOpenChange(false);
        router.refresh();
      }
    }
  }, [state, toast, onOpenChange, router]);

  if (!product) return null;

  const handleVariantChange = (variantId: string) => {
    const variant = product.product_variants.find((v) => v.id === variantId);
    setSelectedVariant(variant || null);
    if (variant && quantity > variant.stock) {
      setQuantity(variant.stock > 0 ? 1 : 0);
    }
    if (variant && variant.stock === 0) {
      setQuantity(0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newQuantity = e.target.valueAsNumber || 0;
    if (selectedVariant) {
      if (newQuantity > selectedVariant.stock) {
        newQuantity = selectedVariant.stock;
      }
      if (newQuantity < 1 && selectedVariant.stock > 0) {
        newQuantity = 1;
      }
    }
    setQuantity(newQuantity);
  };

  const isSubmitDisabled =
    !selectedVariant ||
    quantity <= 0 ||
    (selectedVariant && quantity > selectedVariant.stock);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Tambah ke Keranjang</DialogTitle>
          <DialogDescription>Pilih varian produk untuk melanjutkan.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 py-2">
          <div className="w-24 h-24 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
             <Image
                src={product.image_url || '/img/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 line-clamp-2">{product.name}</h3>
            <div className="mt-1">
               {product.categories && (
                 <Badge variant="secondary" className="text-[10px] px-2 bg-blue-50 text-blue-600 border-blue-100">
                   {product.categories.name}
                 </Badge>
               )}
            </div>
          </div>
        </div>
        
        <form ref={formRef} action={formAction} className="space-y-5 mt-2">
          <input
            type="hidden"
            name="variant_id"
            value={selectedVariant?.id || ''}
          />
          <input type="hidden" name="quantity" value={quantity} />

          {/* Pilihan Varian */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Pilih Ukuran / Varian:</Label>
            <RadioGroup
              onValueChange={handleVariantChange}
              className="flex flex-wrap gap-2"
              value={selectedVariant?.id}
            >
              {product.product_variants.length === 0 ? (
                 <p className="text-sm text-red-500 italic">Stok belum tersedia.</p>
              ) : (
                product.product_variants.map((variant) => (
                  <div key={variant.id}>
                    <RadioGroupItem
                      value={variant.id}
                      id={variant.id}
                      className="peer sr-only"
                      disabled={variant.stock === 0}
                    />
                    <Label
                      htmlFor={variant.id}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-lg border-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all min-w-[4rem]',
                        'hover:bg-gray-50 peer-focus:ring-2 peer-focus:ring-cyan-500 peer-focus:ring-offset-2',
                        'peer-data-[state=checked]:border-cyan-600 peer-data-[state=checked]:bg-cyan-50 peer-data-[state=checked]:text-cyan-700',
                        'peer-data-[disabled]:opacity-50 peer-data-[disabled]:cursor-not-allowed peer-data-[disabled]:bg-gray-100 peer-data-[disabled]:border-gray-200',
                      )}
                    >
                      <span className="font-bold">{variant.size}</span>
                      <span className="text-[10px] font-normal mt-0.5 opacity-80">
                         {variant.stock > 0 ? `Stok: ${variant.stock}` : 'Habis'}
                      </span>
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>
          </div>

          {/* Pilihan Jumlah */}
          {selectedVariant && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                 <Label htmlFor="qty-input" className="font-semibold text-gray-700">Jumlah:</Label>
                 <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border">
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                      disabled={quantity <= 1}
                    >-</button>
                    <Input
                      id="qty-input"
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min={1}
                      max={selectedVariant.stock}
                      className="w-12 h-8 text-center border-none p-0 focus-visible:ring-0 font-bold"
                    />
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                      disabled={quantity >= selectedVariant.stock}
                    >+</button>
                 </div>
              </div>
              
              <div className="flex justify-between items-center border-t pt-3 border-gray-200">
                 <span className="text-sm text-gray-600">Total Harga:</span>
                 <span className="text-lg font-bold text-[#E8207E]">
                    {formatCurrency(selectedVariant.price * quantity)}
                 </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg"
            >
              Batal
            </Button>
            <SubmitButton disabled={isSubmitDisabled} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}