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

export async function completeOrder(orderId: string) {
  const supabase = createSupabaseServerClient();

  // 1. Cek User Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    // 2. Verifikasi kepemilikan pesanan dan status saat ini
    // Kita hanya boleh mengubah status jika status saat ini 'shipped'
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !order) {
      return { success: false, message: 'Pesanan tidak ditemukan.' };
    }

    if (order.status !== 'shipped') {
      return { success: false, message: 'Status pesanan tidak valid untuk diselesaikan.' };
    }

    // 3. Update status menjadi completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .eq('user_id', user.id); // Double check ownership

    if (updateError) {
      console.error('Error updating order:', updateError);
      return { success: false, message: 'Gagal mengupdate status pesanan.' };
    }

    // 4. Revalidate halaman agar UI berubah otomatis
    revalidatePath('/dashboard/customer/history');
    return { success: true, message: 'Pesanan berhasil diselesaikan.' };

  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, message: 'Terjadi kesalahan sistem.' };
  }
}