'use server';

import { createSupabaseServerClient as createClient } from '@/lib/supabaseServerClient';
import { OrderWithDetails } from '@/types/order';

export async function getCustomerOrders(): Promise<{ success: boolean; data?: OrderWithDetails[]; error?: string }> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Ambil Order, Item, Varian, Produk, DAN Review yang terkait dengan order ini
    // Query ini penting untuk logika "is_reviewed"
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product_variants (
            size,
            products (
              id,
              name,
              image_url
            )
          )
        ),
        reviews (
          id,
          product_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }

    // Transformasi data untuk menandai item yang sudah direview
    const formattedData: OrderWithDetails[] = data.map((order: any) => {
      // Buat Set berisi ID produk yang sudah direview di order ini agar pencarian cepat
      // Kita memetakan 'order.reviews' yang didapat dari relation
      const reviewedProductIds = new Set(
        order.reviews?.map((r: any) => r.product_id) || []
      );

      return {
        ...order,
        order_items: order.order_items.map((item: any) => ({
          ...item,
          // Cek apakah product_id item ini ada di daftar review order ini
          is_reviewed: item.product_variants?.products?.id 
            ? reviewedProductIds.has(item.product_variants.products.id) 
            : false
        })),
      };
    });

    return { success: true, data: formattedData };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}