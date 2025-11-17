'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Tipe state standar untuk form
export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// --- SKEMA UNTUK MANAJEMEN VARIAN & STOK ---

// Skema untuk Tambah/Update Varian (Data Pokok Varian)
const variantSchema = z.object({
  id: z.string().uuid().optional().nullable(), // Opsional untuk create
  product_id: z.string().uuid('Produk harus dipilih'),
  size: z.string().min(1, 'Ukuran tidak boleh kosong'),
  price: z.coerce.number().min(0, 'Harga harus positif'),
  sku: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)), // Ubah string kosong jadi null
});

// Skema untuk Penyesuaian Stok
const stockAdjustmentSchema = z.object({
  variant_id: z.string().uuid(),
  new_stock: z.coerce.number().min(0, 'Stok baru harus 0 atau lebih'),
  current_stock: z.coerce.number(),
  notes: z.string().min(3, 'Catatan/alasan tidak boleh kosong'),
});

// --- Server Action: Tambah/Update Varian ---
export async function upsertVariant(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = createSupabaseServerClient();

  const validatedFields = variantSchema.safeParse({
    id: formData.get('id'),
    product_id: formData.get('product_id'),
    size: formData.get('size'),
    price: formData.get('price'),
    sku: formData.get('sku'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, product_id, size, price, sku } = validatedFields.data;

  // Jika tidak ada ID, ini adalah 'create' dan kita harus cek stok awal
  let initialStock = 0;
  if (!id) {
    const stockField = formData.get('stock');
    initialStock = stockField ? parseInt(stockField as string, 10) : 0;
    if (isNaN(initialStock) || initialStock < 0) {
      return {
        success: false,
        message: 'Validasi gagal',
        errors: { stock: ['Stok awal harus angka positif'] },
      };
    }
  }

  try {
    const dataToUpsert = {
      id: id || undefined, // Biarkan Supabase generate jika !id
      product_id,
      size,
      price,
      sku,
      stock: id ? undefined : initialStock, // Hanya set stok saat create
    };

    // 1. Upsert Varian
    const { data: variantData, error: variantError } = await supabase
      .from('product_variants')
      .upsert(dataToUpsert)
      .select()
      .single();

    if (variantError) throw variantError;

    // 2. Jika ini 'create' (tidak ada 'id') dan stok awal > 0, catat
    if (!id && initialStock > 0 && variantData) {
      await supabase.from('stock_movements').insert({
        variant_id: variantData.id,
        quantity_change: initialStock,
        reason: 'initial_stock',
        notes: 'Stok awal saat varian dibuat',
      });
    }

    revalidatePath('/dashboard/admin/stock');
    revalidatePath('/dashboard/admin/products');
    return {
      success: true,
      message: `Varian berhasil ${id ? 'diperbarui' : 'dibuat'}.`,
    };
  } catch (e: any) {
    // --- PERUBAHAN DI SINI ---
    // Tangani error duplikat
    if (e.code === '23505') {
      if (e.message.includes('unique_product_size')) {
        return {
          success: false,
          message:
            'Gagal: Varian dengan ukuran ini sudah ada untuk produk tersebut.',
        };
      }
      if (e.message.includes('product_variants_sku_key')) {
        return {
          success: false,
          message: 'Gagal: SKU ini sudah digunakan oleh varian lain.',
        };
      }
    }
    // --- BATAS PERUBAHAN ---
    return { success: false, message: `Gagal menyimpan varian: ${e.message}` };
  }
}

// --- Server Action: Sesuaikan Stok ---
export async function adjustStock(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = createSupabaseServerClient();

  const validatedFields = stockAdjustmentSchema.safeParse({
    variant_id: formData.get('variant_id'),
    new_stock: formData.get('new_stock'),
    current_stock: formData.get('current_stock'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { variant_id, new_stock, current_stock, notes } = validatedFields.data;
  const quantity_change = new_stock - current_stock;

  if (quantity_change === 0) {
    return {
      success: true,
      message: 'Tidak ada perubahan stok.',
    };
  }

  try {
    // 1. Catat pergerakan stok
    await supabase.from('stock_movements').insert({
      variant_id,
      quantity_change,
      reason: 'manual_adjustment',
      notes,
    });

    // 2. Update stok di tabel product_variants
    await supabase
      .from('product_variants')
      .update({ stock: new_stock })
      .eq('id', variant_id);

    revalidatePath('/dashboard/admin/stock');
    revalidatePath('/dashboard/admin/products');
    return { success: true, message: 'Stok berhasil diperbarui.' };
  } catch (e: any) {
    return {
      success: false,
      message: `Gagal memperbarui stok: ${e.message}`,
    };
  }
}

// --- Server Action: Hapus Varian ---
export async function deleteVariant(variantId: string): Promise<FormState> {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Cek apakah varian pernah dibeli (ada di order_items)
    const { data: orderItems, error: checkError } = await supabase
      .from('order_items')
      .select('id')
      .eq('variant_id', variantId)
      .limit(1);

    if (checkError) throw checkError;
    if (orderItems && orderItems.length > 0) {
      throw new Error(
        'Varian ini tidak dapat dihapus karena sudah menjadi bagian dari transaksi (order).',
      );
    }

    // Hapus relasi
    await supabase.from('cart_items').delete().eq('variant_id', variantId);
    await supabase.from('stock_movements').delete().eq('variant_id', variantId);

    // Hapus varian
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (deleteError) throw deleteError;

    revalidatePath('/dashboard/admin/stock');
    revalidatePath('/dashboard/admin/products');
    return { success: true, message: 'Varian berhasil dihapus.' };
  } catch (e: any) {
    return { success: false, message: `Gagal menghapus varian: ${e.message}` };
  }
}