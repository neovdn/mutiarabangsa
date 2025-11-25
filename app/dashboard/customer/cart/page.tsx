import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { CartClient } from './cart-client';
import { Suspense } from 'react';
import { ShoppingCart } from 'lucide-react';

// Tipe data yang kita fetch, sekarang menyertakan 'stock'
export type CartItemWithDetails = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    size: string;
    price: number;
    stock: number; // <-- PENTING: Field ini ditambahkan untuk validasi di client
    products: {
      id: string;
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

// Fungsi untuk mengambil data keranjang
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
    // ^^^ 'stock' ditambahkan di query select di atas
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cart items:', error.message);
    return [];
  }

  // @ts-ignore
  return data as CartItemWithDetails[];
}

// Komponen Halaman Keranjang (Server Component)
export default async function CustomerCartPage() {
  const cartItems = await getCartItems();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Keranjang Belanja</h2>
        <p className="text-gray-600">Periksa item Anda sebelum checkout</p>
      </div>

      {cartItems.length === 0 ? (
        // Tampilan Keranjang Kosong
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-black" />
            </div>
            <h3 className="text-2xl font-semibold text-black mb-3">
              Keranjang Anda Kosong
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Sepertinya Anda belum menambahkan produk apapun ke keranjang.
            </p>
          </div>
        </div>
      ) : (
        // Render Client Component dan teruskan data
        <Suspense fallback={<div>Memuat keranjang...</div>}>
          <CartClient cartItems={cartItems} />
        </Suspense>
      )}
    </>
  );
}