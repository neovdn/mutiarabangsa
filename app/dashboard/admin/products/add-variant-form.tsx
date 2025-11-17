'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { upsertVariant, VariantFormState } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AddVariantFormProps {
  productId: string;
  onCancel: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Simpan Varian'}
    </Button>
  );
}

export function AddVariantForm({ productId, onCancel }: AddVariantFormProps) {
  const initialState: VariantFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(upsertVariant, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset(); // Kosongkan form
        onCancel(); // Tutup form
        router.refresh(); // Refresh data server
      }
    }
  }, [state, toast, onCancel, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="p-4 border rounded-lg space-y-4"
    >
      <input type="hidden" name="product_id" value={productId} />
      <h4 className="font-semibold text-lg">Tambah Varian Baru</h4>
      
      {/* Grid untuk layout form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom 1: Ukuran & Harga */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="size">Ukuran (Size)</Label>
            <Input id="size" name="size" placeholder="Contoh: M, L, XL, 27" required />
            {state.errors?.size && (
              <p className="text-sm text-red-500">{state.errors.size[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input id="price" name="price" type="number" placeholder="50000" required />
            {state.errors?.price && (
              <p className="text-sm text-red-500">{state.errors.price[0]}</p>
            )}
          </div>
        </div>

        {/* Kolom 2: Stok & SKU */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Stok Awal</Label>
            <Input id="stock" name="stock" type="number" placeholder="10" defaultValue="0" required />
            {state.errors?.stock && (
              <p className="text-sm text-red-500">{state.errors.stock[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Opsional)</Label>
            <Input id="sku" name="sku" placeholder="Contoh: KEMEJA-SD-M" />
            {state.errors?.sku && (
              <p className="text-sm text-red-500">{state.errors.sku[0]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}