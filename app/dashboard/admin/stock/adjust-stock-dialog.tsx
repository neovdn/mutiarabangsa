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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { adjustStock, FormState } from './actions';

interface AdjustStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  variant: (ProductVariant & { products: { name: string } | null }) | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Simpan Perubahan Stok'}
    </Button>
  );
}

export function AdjustStockDialog({
  isOpen,
  onOpenChange,
  variant,
}: AdjustStockDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useFormState(adjustStock, initialState);

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

  // Reset form setiap kali dialog dibuka dengan variant baru
  useEffect(() => {
    if (variant) {
      formRef.current?.reset();
    }
  }, [variant, isOpen]);

  if (!variant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sesuaikan Stok</DialogTitle>
          <DialogDescription>
            Atur jumlah stok untuk:{' '}
            <span className="font-semibold text-foreground">
              {variant.products?.name} ({variant.size})
            </span>
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="variant_id" value={variant.id} />
          <input
            type="hidden"
            name="current_stock"
            value={variant.stock}
          />

          <div className="space-y-2">
            <Label htmlFor="current_stock_display">Stok Saat Ini</Label>
            <Input
              id="current_stock_display"
              value={variant.stock}
              disabled
              className="font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_stock">Stok Baru</Label>
            <Input
              id="new_stock"
              name="new_stock"
              type="number"
              defaultValue={variant.stock}
              required
            />
            {state.errors?.new_stock && (
              <p className="text-sm text-red-500">
                {state.errors.new_stock[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Alasan Perubahan)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Contoh: Koreksi stok, barang masuk, dll."
              required
            />
            {state.errors?.notes && (
              <p className="text-sm text-red-500">{state.errors.notes[0]}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}