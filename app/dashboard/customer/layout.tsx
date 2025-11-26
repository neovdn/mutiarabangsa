/* File: app/dashboard/customer/layout.tsx
   Deskripsi: Mengambil data profil dan DETAIL item keranjang untuk navbar.
*/

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { Profile } from '@/types/user';
import CustomerNavbar from '@/components/CustomerNavbar';

// Definisikan tipe lokal untuk cart item di navbar
export type NavbarCartItem = {
  id: string;
  quantity: number;
  product_variants: {
    price: number;
    products: {
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Ubah state dari cartCount (number) menjadi cartItems (array)
  const [cartItems, setCartItems] = useState<NavbarCartItem[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profileData) {
        router.push('/login');
        return;
      }

      if (profileData.role !== 'customer') {
        router.push('/dashboard/admin');
        return;
      }

      setProfile(profileData);

      // Ambil DETAIL item keranjang, bukan cuma count
      const fetchCartItems = async (userId: string) => {
        const { data, error: cartError } = await supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            product_variants (
              price,
              products (
                name,
                image_url
              )
            )
          `)
          .eq('user_id', userId);

        if (cartError) {
          console.error('Error fetching cart:', cartError.message);
        } else {
          // @ts-ignore
          setCartItems(data || []);
        }
      };

      fetchCartItems(profileData.id);
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8207E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Kirim array cartItems ke Navbar */}
      <CustomerNavbar
        userProfile={profile} 
        cartItems={cartItems} 
      />
      
      <main className="flex-1 overflow-auto p-0">
        {children}
      </main>
    </div>
  );
}