'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useFormState, useFormStatus } from 'react-dom';
import { upsertProduct, FormState } from './actions';
import { ProductWithDetails, Category } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

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
import { Textarea } from '@/components/ui/textarea';

// --- TAMBAHAN BARU ---
// Tipe baru untuk kategori yang sudah diproses
interface ProcessedCategory {
  id: string;
  name: string; // Akan berisi "Induk > Anak"
  isChild: boolean;
}

// Helper function untuk memproses kategori
function processCategories(categories: Category[]): ProcessedCategory[] {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
  const processed: ProcessedCategory[] = [];

  for (const cat of categories) {
    // Jika ini adalah kategori induk (tidak punya parent_id)
    if (!cat.parent_id) {
      processed.push({ id: cat.id, name: cat.name, isChild: false });

      // Cari semua anaknya
      for (const child of categories) {
        if (child.parent_id === cat.id) {
          processed.push({
            id: child.id,
            name: `${cat.name} > ${child.name}`, // Format: "Induk > Anak"
            isChild: true,
          });
        }
      }
    }
  }

  // Jika Anda hanya ingin menampilkan sub-kategori (paling spesifik)
  // return processed.filter(cat => cat.isChild);
  
  // Untuk sekarang, kita tampilkan semua agar admin bisa memilih
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}
// --- BATAS TAMBAHAN ---

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithDetails | null;
  categories: Category[];
  onFormSubmit: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Simpan'}
    </Button>
  );
}

export function ProductFormDialog({
  isOpen,
  onOpenChange,
  product,
  categories,
  onFormSubmit,
}: ProductFormDialogProps) {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(
    product?.image_url || null,
  );

  // Proses kategori untuk dropdown
  const processedCategories = processCategories(categories);

  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useFormState(upsertProduct, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Berhasil' : 'Gagal',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onFormSubmit();
      }
    }
  }, [state, toast, onFormSubmit]);

  useEffect(() => {
    setPreviewImage(product?.image_url || null);
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
          <DialogDescription>
            Isi detail produk. Varian dan stok dapat diatur setelah produk
            dibuat.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {product && <input type="hidden" name="id" value={product.id} />}
          {product?.image_url && (
            <input
              type="hidden"
              name="current_image_url"
              value={product.image_url}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name || ''}
              required
            />
            {state.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Kategori</Label>
            <Select
              name="category_id"
              // Set default value, jika null/undefined, placeholder akan tampil
              defaultValue={product?.category_id || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {/* --- PERUBAHAN DI SINI --- */}
                {/* Kita map dari 'processedCategories' sekarang */}
                {processedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                {/* --- BATAS PERUBAHAN --- */}
              </SelectContent>
            </Select>
            {state.errors?.category_id && (
              <p className="text-sm text-red-500">
                {state.errors.category_id[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description || ''}
              placeholder="Detail produk..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Gambar Produk</Label>
            {previewImage && (
              <div className="mt-2">
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-md object-cover w-20 h-20"
                />
              </div>
            )}
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-xs text-gray-500">
              {product
                ? 'Kosongkan jika tidak ingin mengubah gambar.'
                : 'Upload gambar produk.'}
            </p>
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