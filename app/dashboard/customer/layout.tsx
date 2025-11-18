'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import type { Profile } from '@/types/user';
import CustomerNavbar from '@/components/CustomerNavbar';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATE BARU UNTUK JUMLAH ITEM KERANJANG ---
  const [cartCount, setCartCount] = useState<number | null>(null);
  // ------------------------------------------

  // Logika otentikasi terpusat
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

      // --- LOGIC BARU: AMBIL JUMLAH KERANJANG ---
      const fetchCartCount = async (userId: string) => {
        // Kita hanya butuh hitungan, jadi 'head: true' lebih efisien
        const { count, error: countError } = await supabase
          .from('cart_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) {
          console.error('Error fetching cart count:', countError.message);
          setCartCount(0); // Set 0 jika error
        } else {
          setCartCount(count ?? 0);
        }
      };

      fetchCartCount(profileData.id);
      // --- BATAS LOGIC BARU ---

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]); // Menambahkan supabase ke dependency array

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* --- KIRIM cartCount SEBAGAI PROP --- */}
      <CustomerNavbar
        userName={profile?.full_name || 'Customer'}
        cartCount={cartCount}
      />
      {/* ---------------------------------- */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}