'use server';

import { supabase } from '@/lib/supabaseClient';
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

// Fungsi untuk upload gambar ke Supabase Storage
async function uploadImage(
  productId: string,
  imageFile: File,
): Promise<string | null> {
  if (imageFile.size === 0) {
    return null; // Tidak ada gambar baru
  }

  const fileExtension = imageFile.name.split('.').pop();
  const newFileName = `${productId}-${Date.now()}.${fileExtension}`;
  const filePath = `product-images/${newFileName}`;

  // Pastikan Anda sudah membuat bucket 'product-images' di Supabase
  // dengan akses publik untuk 'read'.
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
    // --- PERBAIKAN DI SINI ---
    // Kita petakan hasil validasi secara eksplisit untuk mencocokkan tipe Product
    const dataToUpsert: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
      name: validatedFields.data.name,
      description: validatedFields.data.description || null, // Mengubah undefined -> null
      category_id: validatedFields.data.category_id,
      image_url: imageUrl, // Default ke gambar lama
    };
    // --- BATAS PERBAIKAN ---

    // Tentukan ID: gunakan yang ada (edit) atau buat baru (create)
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
      // Upload gambar baru
      imageUrl = await uploadImage(idToUse, imageFile);
      dataToUpsert.image_url = imageUrl;
    }

    // 2. Upsert data produk
    const { error } = await supabase.from('products').upsert({
      id: idToUse, // Tentukan ID di sini
      ...dataToUpsert,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

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
  if (!productId) {
    return { success: false, message: 'ID Produk tidak valid.' };
  }

  try {
    // Hapus varian terkait terlebih dahulu
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (variantError) throw variantError;

    // Hapus produk
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) throw productError;

    // (Opsional) Hapus gambar dari storage
    // ... logika untuk mengambil image_url dan menghapusnya dari storage ...

    revalidatePath('/dashboard/admin/products');
    return { success: true, message: 'Produk berhasil dihapus.' };
  } catch (e: any) {
    return { success: false, message: `Gagal menghapus produk: ${e.message}` };
  }
}