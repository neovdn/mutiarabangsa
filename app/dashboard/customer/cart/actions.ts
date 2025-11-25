'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type CartFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// Skema untuk validasi input tambah ke keranjang
const addToCartSchema = z.object({
  variant_id: z.string().uuid('Varian produk tidak valid'),
  quantity: z.coerce.number().int().min(1, 'Jumlah harus minimal 1'),
});

// --- ACTION 1: Tambah Item ke Keranjang ---
export async function addItemToCart(
  prevState: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  const supabase = createSupabaseServerClient();

  // 1. Dapatkan sesi pengguna
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Gagal: Anda harus login.' };
  }

  // 2. Validasi data form
  const validatedFields = addToCartSchema.safeParse({
    variant_id: formData.get('variant_id'),
    quantity: formData.get('quantity'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { variant_id, quantity } = validatedFields.data;

  try {
    // 3. Cek apakah item sudah ada di keranjang
    const { data: existingItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('variant_id', variant_id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingItem) {
      // 4a. Jika ada, perbarui jumlahnya
      const newQuantity = existingItem.quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (updateError) throw updateError;
    } else {
      // 4b. Jika tidak ada, masukkan sebagai item baru
      const { error: insertError } = await supabase.from('cart_items').insert({
        user_id: user.id,
        variant_id: variant_id,
        quantity: quantity,
      });

      if (insertError) throw insertError;
    }

    // 5. Revalidasi halaman keranjang
    revalidatePath('/dashboard/customer/cart');

    return { success: true, message: 'Produk berhasil ditambahkan ke keranjang!' };
  } catch (e: any) {
    return {
      success: false,
      message: `Terjadi kesalahan: ${e.message}`,
    };
  }
}

// --- ACTION 2: Update Kuantitas Item ---
export async function updateCartItemQuantity(itemId: string, newQuantity: number) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Validasi input dasar
    if (newQuantity < 1) {
      return { success: false, message: 'Jumlah minimal adalah 1' };
    }

    // 2. Cek stok sebelum update (mencegah update melebihi stok di DB)
    const { data: cartItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('variant_id, product_variants(stock)')
      .eq('id', itemId)
      .single();

    if (fetchError || !cartItem) throw new Error('Item tidak ditemukan');
    
    // @ts-ignore
    const availableStock = cartItem.product_variants?.stock || 0;

    if (newQuantity > availableStock) {
        return { success: false, message: `Stok tidak mencukupi. Maksimal: ${availableStock}` };
    }

    // 3. Update
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/dashboard/customer/cart');
    return { success: true, message: 'Jumlah diperbarui' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// --- ACTION 3: Hapus Satu Item ---
export async function deleteCartItem(itemId: string) {
  const supabase = createSupabaseServerClient();
  
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/dashboard/customer/cart'); // Update tabel keranjang
    revalidatePath('/dashboard/customer'); // Update badge notifikasi di navbar
    return { success: true, message: 'Item dihapus dari keranjang' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// --- ACTION 4: Kosongkan Seluruh Keranjang ---
export async function clearCart() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'Unauthorized' };

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/customer/cart');
    revalidatePath('/dashboard/customer');
    return { success: true, message: 'Keranjang dikosongkan' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}