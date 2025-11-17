'use client';

import { useState, useTransition } from 'react';
import { ProductVariant, ProductWithDetails } from '@/types/product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { AdjustStockDialog } from './adjust-stock-dialog';
import { AddVariantForm } from './add-variant-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteVariant } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface VariantStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithDetails | null;
}

export function VariantStockDialog({
  isOpen,
  onOpenChange,
  product,
}: VariantStockDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State untuk form "Add Variant"
  const [showAddForm, setShowAddForm] = useState(false);

  // State untuk dialog "Adjust Stock"
  const [adjustVariant, setAdjustVariant] = useState<ProductVariant | null>(
    null,
  );

  // State untuk dialog "Delete Variant"
  const [deleteVariantTarget, setDeleteVariantTarget] =
    useState<ProductVariant | null>(null);

  if (!product) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = () => {
    if (!deleteVariantTarget) return;

    startTransition(async () => {
      const result = await deleteVariant(deleteVariantTarget.id);
      if (result.success) {
        toast({ title: 'Berhasil', description: result.message });
        setDeleteVariantTarget(null);
        router.refresh(); // Refresh data server
      } else {
        toast({
          title: 'Gagal',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  // Reset form saat dialog ditutup
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowAddForm(false);
    }
    onOpenChange(open);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kelola Varian & Stok</DialogTitle>
            <DialogDescription>
              Atur ukuran, harga, dan stok untuk produk:
              <span className="font-semibold text-foreground ml-1">
                {product.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Daftar Varian yang Ada */}
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ukuran</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.product_variants.length > 0 ? (
                  product.product_variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">
                        {variant.size}
                      </TableCell>
                      <TableCell>{formatCurrency(variant.price)}</TableCell>
                      <TableCell
                        className={cn(
                          variant.stock < 10 && 'text-destructive font-bold',
                        )}
                      >
                        {variant.stock}
                      </TableCell>
                      <TableCell>{variant.sku || '-'}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setAdjustVariant(variant)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Atur Stok</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteVariantTarget(variant)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus Varian</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      Belum ada varian untuk produk ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Form Tambah Varian Baru */}
          {showAddForm ? (
            <AddVariantForm
              productId={product.id}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Varian Baru
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nested: Adjust Stock */}
      <AdjustStockDialog
        variant={adjustVariant}
        isOpen={!!adjustVariant}
        onOpenChange={() => setAdjustVariant(null)}
      />

      {/* Dialog Nested: Delete Variant Confirmation */}
      <AlertDialog
        open={!!deleteVariantTarget}
        onOpenChange={() => setDeleteVariantTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Varian{' '}
              <span className="font-bold">
                {product.name} ({deleteVariantTarget?.size})
              </span>{' '}
              akan dihapus. Tindakan ini tidak dapat dibatalkan. Pastikan tidak
              ada transaksi aktif yang menggunakan varian ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}