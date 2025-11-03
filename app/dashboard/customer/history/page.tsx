'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabaseClient';
import { Store, ShoppingCart, History } from 'lucide-react';
import type { Profile } from '@/types/user';

export default function CustomerOrdersPage() {
  const router = useRouter();
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
      active: false,
    },
    {
      label: 'Riwayat Pesanan',
      icon: <History className="h-5 w-5" />,
      href: '/dashboard/customer/history',
      active: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userName={profile?.full_name || 'Customer'} menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Riwayat Pesanan</h2>
            <p className="text-gray-600">Lihat semua transaksi Anda sebelumnya</p>
          </div>

          {/* Konten Halaman Riwayat Pesanan */}
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <History className="h-12 w-12 text-black" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-3">
                Belum Ada Riwayat Pesanan
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Anda belum melakukan pembelian apapun. Setelah Anda menyelesaikan pesanan, riwayatnya akan muncul di sini.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}