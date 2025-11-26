import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { CartClient } from './cart-client';
import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Tipe data yang kita fetch
export type CartItemWithDetails = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    size: string;
    price: number;
    stock: number;
    products: {
      id: string;
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

async function getCartItems(): Promise<CartItemWithDetails[]> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      quantity,
      product_variants (
        id,
        size,
        price,
        stock, 
        products (
          id,
          name,
          image_url
        )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cart items:', error.message);
    return [];
  }

  // @ts-ignore
  return data as CartItemWithDetails[];
}

export default async function CustomerCartPage() {
  const cartItems = await getCartItems();

  return (
    // Background Gradient Konsisten
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-6">
        
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
             <ShoppingCart className="h-6 w-6 text-[#E8207E]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h2>
            <p className="text-sm text-gray-500">Periksa item Anda sebelum checkout</p>
          </div>
        </div>

        <Suspense fallback={<div className="text-center py-10 text-gray-500">Memuat keranjang...</div>}>
          <CartClient cartItems={cartItems} />
        </Suspense>
      </div>
    </div>
  );
}