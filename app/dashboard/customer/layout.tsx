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

      // Melindungi rute customer
      if (profileData.role !== 'customer') {
        // Jika admin, lempar ke dashboard admin
        router.push('/dashboard/admin');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]); // Menambahkan supabase ke dependency array

  // Menampilkan loading state
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

  // Render layout persisten
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CustomerNavbar userName={profile?.full_name || 'Customer'} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}