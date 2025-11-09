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

// --- Tipe Sederhana (Hanya perlu ID dan Nama) ---
interface ProcessedCategory {
  id: string;
  name: string; // Akan berisi "Induk > Anak"
}

// --- LOGIKA BARU DI FUNGSI INI ---
// Helper function untuk memproses kategori
function processCategories(categories: Category[]): ProcessedCategory[] {
  // 1. Buat Map untuk mencari nama kategori berdasarkan ID
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
  
  // 2. Buat Set (daftar unik) dari semua ID yang merupakan 'parent_id'
  //    Ini adalah semua kategori yang memiliki anak (kategori Induk)
  const parentIds = new Set<string>();
  for (const cat of categories) {
    if (cat.parent_id) {
      parentIds.add(cat.parent_id);
    }
  }

  const processed: ProcessedCategory[] = [];

  // 3. Iterasi semua kategori
  for (const cat of categories) {
    // 4. HANYA tampilkan kategori yang BUKAN merupakan induk
    //    (ID-nya tidak ada di dalam Set parentIds)
    if (!parentIds.has(cat.id)) {
      let displayName = cat.name;
      
      // 5. Jika dia kategori "daun" TAPI punya induk, buat format "Induk > Anak"
      if (cat.parent_id) {
        const parentName = categoryMap.get(cat.parent_id);
        if (parentName) {
          displayName = `${parentName} > ${cat.name}`;
        }
      }
      // Jika dia kategori "daun" TAPI tidak punya induk (misal: kategori tunggal)
      // maka 'displayName' akan tetap nama aslinya.

      processed.push({
        id: cat.id,
        name: displayName,
      });
    }
  }

  // 6. Urutkan berdasarkan nama untuk tampilan yang rapi
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}
// --- BATAS PERUBAHAN LOGIKA ---

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
  const processedCategories = processCategories(categories); // Memanggil fungsi baru

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
              defaultValue={product?.category_id || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {/* --- Map dari 'processedCategories' yang sudah difilter --- */}
                {processedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
                {/* --- Batas Perubahan --- */}
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