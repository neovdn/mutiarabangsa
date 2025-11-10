'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Store, ShoppingCart, History } from 'lucide-react';
import type { Profile } from '@/types/user';

export default function CustomerCartPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

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

      if (profileData.role === 'admin') {
        router.push('/dashboard/admin');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      label: 'Katalog',
      icon: <Store className="h-5 w-5" />,
      href: '/dashboard/customer',
      active: false,
    },
    {
      label: 'Keranjang',
      icon: <ShoppingCart className="h-5 w-5" />,
      href: '/dashboard/customer/cart',
      active: true,
    },
    {
      label: 'Riwayat Pesanan',
      icon: <History className="h-5 w-5" />,
      href: '/dashboard/customer/history',
      active: false,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userName={profile?.full_name || 'Customer'} menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Keranjang Belanja</h2>
            <p className="text-gray-600">Periksa item Anda sebelum checkout</p>
          </div>

          {/* Konten Halaman Keranjang */}
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-3">
                Keranjang Anda Kosong
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sepertinya Anda belum menambahkan produk apapun ke keranjang. Mulai jelajahi katalog untuk menemukan barang yang Anda butuhkan!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}