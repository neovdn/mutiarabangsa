'use server';

// Menggunakan client server yang baru
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Product } from '@/types/product';

// Skema validasi menggunakan Zod
const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  description: z.string().optional(),
  category_id: z.string().uuid('Kategori tidak valid').nullable(),
});

export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// Fungsi 'uploadImage' yang menerima client terotentikasi
async function uploadImage(
  supabase: ReturnType<typeof createSupabaseServerClient>, // <-- Terima client sebagai argumen
  productId: string,
  imageFile: File,
): Promise<string | null> {
  if (imageFile.size === 0) {
    return null; // Tidak ada gambar baru
  }

  const fileExtension = imageFile.name.split('.').pop();
  const newFileName = `${productId}-${Date.now()}.${fileExtension}`;
  const filePath = `product-images/${newFileName}`;

  // 'supabase' di sini sekarang adalah client yang terotentikasi (Admin)
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, imageFile);

  if (error) {
    throw new Error(`Gagal upload gambar: ${error.message}`);
  }

  // Mendapatkan URL publik
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Server Action untuk Create/Update Produk
export async function upsertProduct(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Buat client server DI DALAM server action
  const supabase = createSupabaseServerClient();

  const validatedFields = productSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    category_id: formData.get('category_id') || null,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const productId = formData.get('id') as string | null;
  const imageFile = formData.get('image') as File;
  let imageUrl = formData.get('current_image_url') as string | null;

  try {
    const dataToUpsert: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
      name: validatedFields.data.name,
      description: validatedFields.data.description || null,
      category_id: validatedFields.data.category_id,
      image_url: imageUrl,
    };

    const idToUse = productId || crypto.randomUUID();

    // 1. Upload gambar baru jika ada
    if (imageFile && imageFile.size > 0) {
      // Hapus gambar lama jika ada
      if (imageUrl) {
        const oldImageName = imageUrl.split('/').pop();
        if (oldImageName) {
          await supabase.storage
            .from('product-images')
            .remove([`product-images/${oldImageName}`]);
        }
      }
      // Kirim client server ke fungsi uploadImage
      imageUrl = await uploadImage(supabase, idToUse, imageFile);
      dataToUpsert.image_url = imageUrl;
    }

    // 2. Upsert data produk
    const { error } = await supabase.from('products').upsert({
      id: idToUse,
      ...dataToUpsert,
      updated_at: new Date().toISOString(),
    });

    if (error) {
       // Cek apakah error terkait RLS
      if (error.code === '42501') {
         throw new Error('Gagal menyimpan produk: Hak akses ditolak. Pastikan RLS untuk tabel "products" sudah benar.');
      }
      throw error;
    }

    revalidatePath('/dashboard/admin/products');
    return {
      success: true,
      message: `Produk berhasil ${productId ? 'diperbarui' : 'dibuat'}.`,
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Terjadi kesalahan: ${e.message}`,
    };
  }
}

// Server Action untuk Hapus Produk
export async function deleteProduct(productId: string): Promise<FormState> {
  const supabase = createSupabaseServerClient();

  if (!productId) {
    return { success: false, message: 'ID Produk tidak valid.' };
  }

  try {
    // Hapus varian terkait terlebih dahulu
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (variantError) {
      if (variantError.code === '42501') {
         throw new Error('Gagal menghapus varian: Hak akses ditolak. Pastikan RLS untuk tabel "product_variants" sudah benar.');
      }
      throw variantError;
    }

    // Hapus produk
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) {
       if (productError.code === '42501') {
         throw new Error('Gagal menghapus produk: Hak akses ditolak. Pastikan RLS untuk tabel "products" sudah benar.');
      }
      throw productError;
    }

    // (Opsional) Hapus gambar dari storage
    // ...

    revalidatePath('/dashboard/admin/products');
    return { success: true, message: 'Produk berhasil dihapus.' };
  } catch (e: any) {
    // --- PERBAIKAN DI SINI ---
    // Mengganti `false` menjadi `success: false`
    return { success: false, message: `Gagal menghapus produk: ${e.message}` };
  }
}