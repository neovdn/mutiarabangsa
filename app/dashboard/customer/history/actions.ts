'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';

export async function buyAgain(orderId: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: 'Unauthorized' };

  try {
    // 1. Ambil item dari order yang mau dibeli lagi
    const { data: orderItems, error: fetchError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId);

    if (fetchError || !orderItems) throw new Error('Gagal mengambil data pesanan');

    // 2. Masukkan ke keranjang (Looping insert/upsert)
    // Kita pakai upsert logic sederhana: jika ada, tambah quantity via query terpisah atau logic di DB
    // Disini kita pakai insert sederhana, asumsi cart item unik per variant_id
    
    for (const item of orderItems) {
      // Cek apakah sudah ada di cart
      const { data: existingCart } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('variant_id', item.variant_id)
        .maybeSingle();

      if (existingCart) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingCart.quantity + item.quantity })
          .eq('id', existingCart.id);
      } else {
        // Insert baru
        await supabase.from('cart_items').insert({
          user_id: user.id,
          variant_id: item.variant_id,
          quantity: item.quantity
        });
      }
    }

    revalidatePath('/dashboard/customer/cart');
    return { success: true, message: 'Produk berhasil masuk keranjang' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}