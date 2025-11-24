'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type CheckoutFormState = {
  success: boolean;
  message: string;
};

// Tipe data internal untuk proses checkout
type CartItemForCheckout = {
  id: string; // id item keranjang
  quantity: number;
  product_variants: {
    size: any;
    id: string;
    stock: number;
    price: number; // Sesuai skema (integer)
    products: {
      name: string;
    } | null;
  } | null;
};

export async function createOrderFromCart(
  prevState: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const supabase = createSupabaseServerClient();

  // 1. Dapatkan user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Gagal: Anda harus login.' };
  }

  // 2. Ambil semua item di keranjang user dari server (data terpercaya)
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      quantity,
      product_variants (
        id,
        size,
        stock,
        price,
        products ( name )
      )
    `,
    )
    .eq('user_id', user.id);

  if (cartError) {
    return { success: false, message: `Gagal mengambil keranjang: ${cartError.message}` };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, message: 'Keranjang Anda kosong.' };
  }

  const items = cartItems as unknown as CartItemForCheckout[];
  let calculatedTotalAmount = 0;
  const itemsForOrderRPC: any[] = []; // Untuk JSONB

  // 3. Validasi Stok dan Hitung Total Harga (Server-side)
  for (const item of items) {
    const variant = item.product_variants;
    const product = variant?.products;

    if (!variant || !product) {
      return {
        success: false,
        message: 'Beberapa item di keranjang Anda tidak valid lagi.',
      };
    }

    // Cek Stok!
    if (item.quantity > variant.stock) {
      return {
        success: false,
        message: `Stok tidak cukup untuk ${product.name} (${variant.size}). Sisa stok: ${variant.stock}.`,
      };
    }

    const itemPrice = variant.price; // Ini adalah integer
    calculatedTotalAmount += itemPrice * item.quantity;

    // Siapkan data untuk dikirim ke RPC
    itemsForOrderRPC.push({
      variant_id: variant.id,
      quantity: item.quantity,
      price_at_purchase: itemPrice,
    });
  }

  // 4. Panggil fungsi RPC yang baru kita buat
  const { data: orderId, error: rpcError } = await supabase.rpc(
    'create_order_and_clear_cart',
    {
      p_user_id: user.id,
      p_total_amount: calculatedTotalAmount, // Kirim sebagai integer
      p_order_items: itemsForOrderRPC,       // Kirim sebagai JSON
    },
  );

  if (rpcError) {
    return {
      success: false,
      message: `Gagal membuat pesanan: ${rpcError.message}`,
    };
  }

  // 5. Revalidasi path dan Redirect
  revalidatePath('/dashboard/customer/cart');
  revalidatePath('/dashboard/customer/history');
  revalidatePath('/dashboard/customer/catalog'); // Stok berubah
  revalidatePath('/dashboard/admin/stock'); // Stok berubah

  redirect(`/dashboard/customer/orders/${orderId}/payment`);
  
  // Baris ini tidak akan tercapai karena redirect
  // return { success: true, message: 'Pesanan berhasil dibuat!' };
}