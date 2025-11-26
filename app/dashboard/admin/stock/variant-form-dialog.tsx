'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ProductVariant } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { upsertVariant, FormState } from './actions';

// Tipe sederhana untuk data produk
type SimpleProduct = {
  id: string;
  name: string;
};

interface VariantFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variant: (ProductVariant & { products: SimpleProduct | null }) | null;
  allProducts: SimpleProduct[];
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending
        ? isEdit
          ? 'Menyimpan...'
          : 'Membuat...'
        : isEdit
          ? 'Simpan Perubahan'
          : 'Buat Varian'}
    </Button>
  );
}

export function VariantFormDialog({
  isOpen,
  onOpenChange,
  variant,
  allProducts,
}: VariantFormDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!variant?.id;

  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useFormState(upsertVariant, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onOpenChange(false); // Tutup dialog
        router.refresh(); // Refresh data
      }
    }
  }, [state, toast, onOpenChange, router]);

  // Reset form setiap kali dialog dibuka
  useEffect(() => {
    if (isOpen) {
      formRef.current?.reset();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Varian Produk' : 'Tambah Varian Baru'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui detail untuk varian ini. Stok diatur terpisah.'
              : 'Buat varian baru dan tentukan stok awalnya.'}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {/* --- PERBAIKAN DI SINI --- */}
          {/* Tambahkan hidden input untuk product_id saat edit mode karena select disabled */}
          {isEdit && (
            <>
              <input type="hidden" name="id" value={variant.id} />
              <input type="hidden" name="product_id" value={variant.product_id} />
            </>
          )}
          {/* --- BATAS PERBAIKAN --- */}

          {/* Kolom 1: Produk & Ukuran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Produk</Label>
              <Select
                name="product_id"
                defaultValue={variant?.product_id || undefined}
                disabled={isEdit} // Field ini disabled saat edit, jadi nilainya tidak terkirim otomatis
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk..." />
                </SelectTrigger>
                <SelectContent>
                  {allProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.product_id && (
                <p className="text-sm text-red-500">
                  {state.errors.product_id[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Ukuran (Size)</Label>
              <Input
                id="size"
                name="size"
                defaultValue={variant?.size || ''}
                placeholder="Contoh: M, L, XL, 27"
                required
              />
              {state.errors?.size && (
                <p className="text-sm text-red-500">{state.errors.size[0]}</p>
              )}
            </div>
          </div>

          {/* Kolom 2: Harga & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={variant?.price || ''}
                placeholder="50000"
                required
              />
              {state.errors?.price && (
                <p className="text-sm text-red-500">{state.errors.price[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Opsional)</Label>
              <Input
                id="sku"
                name="sku"
                defaultValue={variant?.sku || ''}
                placeholder="Contoh: KEMEJA-SD-M"
              />
              {state.errors?.sku && (
                <p className="text-sm text-red-500">{state.errors.sku[0]}</p>
              )}
            </div>
          </div>

          {/* Kolom 3: Stok Awal (Hanya saat Create) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="stock">Stok Awal</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                placeholder="10"
                defaultValue="0"
                required
              />
              {state.errors?.stock && (
                <p className="text-sm text-red-500">{state.errors.stock[0]}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <SubmitButton isEdit={isEdit} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}