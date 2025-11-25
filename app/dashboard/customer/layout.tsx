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
  const [cartCount, setCartCount] = useState<number | null>(null);

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

      // Proteksi: Jika role bukan customer, lempar ke admin
      if (profileData.role !== 'customer') {
        router.push('/dashboard/admin');
        return;
      }

      setProfile(profileData);

      // Ambil jumlah keranjang
      const fetchCartCount = async (userId: string) => {
        const { count, error: countError } = await supabase
          .from('cart_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) {
          console.error('Error fetching cart count:', countError.message);
          setCartCount(0);
        } else {
          setCartCount(count ?? 0);
        }
      };

      fetchCartCount(profileData.id);
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

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
      {/* PERBAIKAN DI SINI:
        Ganti prop 'userName' menjadi 'userProfile' dan kirim objek profile lengkap.
      */}
      <CustomerNavbar
        userProfile={profile} 
        cartCount={cartCount}
      />
      
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}