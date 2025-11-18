'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // <-- Impor useRouter
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

// ... (Interface, SubmitButton, formatCurrency) ...
interface AddToCartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithDetails | null;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Menambahkan...' : 'Tambah ke Keranjang'}
    </Button>
  );
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
// ...

export function AddToCartDialog({
  isOpen,
  onOpenChange,
  product,
}: AddToCartDialogProps) {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter(); // <-- Inisialisasi router

  // State internal dialog
  const [selectedVariant, setSelectedVariant] =
    React.useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const initialState: CartFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(addItemToCart, initialState);

  // Reset state saat dialog dibuka/produk berubah
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

  // Pantau hasil server action
  React.useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onOpenChange(false); // Tutup dialog jika sukses
        router.refresh(); // <-- TAMBAHKAN INI UNTUK REFRESH LAYOUT
      }
    }
  }, [state, toast, onOpenChange, router]); // <-- Tambahkan router ke dependencies

  if (!product) return null;

  // ... (handleVariantChange, handleQuantityChange, isSubmitDisabled) ...
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
  // ...

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* ... (DialogHeader, Info Produk) ... */}
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Pilih varian dan jumlah untuk ditambahkan ke keranjang.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <div className="w-24 flex-shrink-0">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={product.image_url || '/img/placeholder.png'}
                alt={product.name}
                fill
                className="rounded-md object-cover"
              />
            </AspectRatio>
          </div>
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            {product.categories && (
              <Badge variant="secondary">{product.categories.name}</Badge>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
        </div>
        
        <form ref={formRef} action={formAction} className="space-y-4">
          {/* ... (Input Tersembunyi, Pilihan Varian) ... */}
          <input
            type="hidden"
            name="variant_id"
            value={selectedVariant?.id || ''}
          />

          <div className="space-y-2">
            <Label>Pilih Ukuran:</Label>
            <RadioGroup
              onValueChange={handleVariantChange}
              className="flex flex-wrap gap-2"
              value={selectedVariant?.id}
            >
              {product.product_variants.map((variant) => (
                <div key={variant.id}>
                  <RadioGroupItem
                    value={variant.id}
                    id={variant.id}
                    className="sr-only"
                    disabled={variant.stock === 0}
                  />
                  <Label
                    htmlFor={variant.id}
                    className={cn(
                      'flex items-center justify-center rounded-md border-2 px-3 py-2 text-sm font-medium cursor-pointer',
                      'hover:bg-accent',
                      'data-[state=checked]:border-primary data-[state=checked]:bg-primary/10',
                      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/50 data-[disabled]:hover:bg-muted/50',
                    )}
                    data-state={
                      selectedVariant?.id === variant.id ? 'checked' : 'unchecked'
                    }
                    data-disabled={variant.stock === 0}
                  >
                    {variant.size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* ... (Info Stok & Pilihan Jumlah) ... */}
          {selectedVariant && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah:</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={selectedVariant.stock > 0 ? 1 : 0}
                  max={selectedVariant.stock}
                  className="w-24"
                  disabled={selectedVariant.stock === 0}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-600">
                    {formatCurrency(selectedVariant.price)} / pcs
                  </p>
                  <p
                    className={cn(
                      'text-sm',
                      selectedVariant.stock < 10 && selectedVariant.stock > 0
                        ? 'text-destructive'
                        : 'text-muted-foreground',
                      selectedVariant.stock === 0 && 'text-destructive font-medium',
                    )}
                  >
                    Stok tersedia: {selectedVariant.stock}
                  </p>
                </div>
              </div>
              {state.errors?.quantity && (
                <p className="text-sm text-red-500">
                  {state.errors.quantity[0]}
                </p>
              )}
            </div>
          )}

          {/* ... (DialogFooter) ... */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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