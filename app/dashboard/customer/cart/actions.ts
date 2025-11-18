'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type CartFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// Skema untuk validasi input
const addToCartSchema = z.object({
  variant_id: z.string().uuid('Varian produk tidak valid'),
  quantity: z.coerce.number().int().min(1, 'Jumlah harus minimal 1'),
});

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