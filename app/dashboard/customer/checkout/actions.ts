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
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    size: any;
    stock: number;
    price: number;
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'Gagal: Anda harus login.' };
  }

  // Ambil data keranjang
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
    `
    )
    .eq('user_id', user.id);

  if (cartError) {
    return { success: false, message: `Gagal mengambil keranjang: ${cartError.message}` };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, message: 'Keranjang Anda kosong.' };
  }

  const items = cartItems as unknown as CartItemForCheckout[];
  
  // 1. AGREGASI: Gabungkan item yang sama (jika ada duplikat varian di cart)
  // Ini mencegah validasi stok yang salah
  const aggregatedItems = new Map<string, {
    quantity: number,
    price: number,
    stock: number,
    name: string,
    size: string
  }>();

  for (const item of items) {
    const variant = item.product_variants;
    const product = variant?.products;

    if (!variant || !product) {
      return { success: false, message: 'Item tidak valid ditemukan.' };
    }

    const current = aggregatedItems.get(variant.id);
    if (current) {
      current.quantity += item.quantity;
    } else {
      aggregatedItems.set(variant.id, {
        quantity: item.quantity,
        price: variant.price,
        stock: variant.stock, // Stok diambil dari salah satu item (karena sama)
        name: product.name,
        size: variant.size
      });
    }
  }

  let calculatedTotalAmount = 0;
  const itemsForOrderRPC: any[] = [];
  
  // Variable untuk menyimpan error stok saat loop
  let stockError: CheckoutFormState | null = null;

  // 2. VALIDASI & PERSIAPAN DATA
  // Menggunakan forEach agar kompatibel dengan target ES5
  aggregatedItems.forEach((info, variantId) => {
    if (stockError) return; // Skip jika sudah ada error sebelumnya

    // Cek Stok Total per Varian yang sudah diagregasi
    if (info.quantity > info.stock) {
      stockError = {
        success: false,
        message: `Stok tidak cukup untuk ${info.name} (${info.size}). Diminta: ${info.quantity}, Tersedia: ${info.stock}.`,
      };
      return;
    }

    calculatedTotalAmount += info.price * info.quantity;

    // Masukkan ke array untuk dikirim ke RPC
    itemsForOrderRPC.push({
      variant_id: variantId,
      quantity: info.quantity,
      price_at_purchase: info.price,
    });
  });

  // Jika ada error stok, batalkan proses dan kembalikan pesan error
  if (stockError) {
    return stockError;
  }

  // 3. EKSEKUSI TRANSAKSI KE DATABASE
  const { data: orderId, error: rpcError } = await supabase.rpc(
    'create_order_and_clear_cart',
    {
      p_user_id: user.id,
      p_total_amount: calculatedTotalAmount,
      p_order_items: itemsForOrderRPC, // Kita kirim data yang SUDAH diagregasi
    },
  );

  if (rpcError) {
    return {
      success: false,
      message: `Gagal membuat pesanan: ${rpcError.message}`,
    };
  }

  // 4. Revalidasi dan Redirect
  revalidatePath('/dashboard/customer/cart');
  revalidatePath('/dashboard/customer/history');
  revalidatePath('/dashboard/customer/catalog');
  revalidatePath('/dashboard/admin/stock');

  redirect(`/dashboard/customer/orders/${orderId}/payment`);
}