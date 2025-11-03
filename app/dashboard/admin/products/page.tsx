'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import { supabase } from '@/lib/supabaseClient';
import { LayoutDashboard, Package, Receipt, BarChart3 } from 'lucide-react';
import type { Profile } from '@/types/user';

export default function AdminProductsPage() {
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

      if (profileData.role !== 'admin') {
        router.push('/dashboard/customer');
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
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/dashboard/admin',
      active: false,
    },
    {
      label: 'Produk',
      icon: <Package className="h-5 w-5" />,
      href: '/dashboard/admin/products',
      active: true, // <-- Aktif di halaman ini
    },
    {
      label: 'Transaksi',
      icon: <Receipt className="h-5 w-5" />,
      href: '/dashboard/admin/transactions',
      active: false,
    },
    {
      label: 'Laporan',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/dashboard/admin/reports',
      active: false,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userName={profile?.full_name || 'Admin'} menuItems={menuItems} />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Kelola Produk</h2>
            <p className="text-gray-600">Tambah, edit, dan atur semua produk toko Anda</p>
          </div>

          <div className="mb-8">
            <SearchBar />
          </div>

          {/* Konten Halaman Produk */}
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-black mb-3">
                Manajemen Produk
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Gunakan halaman ini untuk menambah, mengedit, dan menghapus produk. Anda juga dapat mengelola stok dan kategori.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}