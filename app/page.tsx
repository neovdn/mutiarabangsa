import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import CustomerNavbar from '@/components/CustomerNavbar';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DashboardSearch } from '@/components/dashboard/dashboard-search';
import { CategorySection } from '@/components/dashboard/category-section';
import { StatsSection } from '@/components/dashboard/stats-section';
import { RecentOrdersWidget } from '@/components/dashboard/recent-orders-widget';
import { FeaturedProducts } from '@/components/dashboard/featured-products';
import { PromoBanner } from '@/components/dashboard/promo-banner';
import { ProductWithDetails, Category } from '@/types/product';
import { Order } from '@/types/order';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  
  // 1. Cek User Session
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  let cartCount = 0;
  let recentOrders: Order[] = [];
  let activeOrderCount = 0;

  // 2. Fetch Data Publik (Produk & Kategori)
  // Ambil Kategori
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .limit(8); // Batasi 8 kategori agar rapi

  // Ambil Produk (Featured) - Random atau Newest
  const { data: productsData } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .order('created_at', { ascending: false })
    .limit(12); // Tampilkan 12 produk terbaru

  // 3. Fetch Data Personal (Jika Login)
  if (user) {
    // Profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = profile;

    // Keranjang
    const { count } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    cartCount = count || 0;

    // Pesanan Terbaru
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    // @ts-ignore
    recentOrders = orders || [];

    // Hitung Pesanan Aktif (Status selain completed/cancelled)
    const { count: activeCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending_payment', 'waiting_confirmation', 'processing', 'shipped']);
    
    activeOrderCount = activeCount || 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CustomerNavbar userProfile={userProfile} cartCount={cartCount} />
      
      <main className="flex-1 w-full">
        {/* Mengurangi padding vertikal agar lebih padat */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 md:px-8 md:py-8">
          <div className="container mx-auto space-y-6 max-w-7xl">
            
            {/* 1. Hero & Search Section (Layout Grid Baru) 
                Agar efisien, di Desktop Hero dan Search bisa berdampingan atau atas bawah yang compact 
            */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
               <DashboardHero />
               {/* Search ditempelkan tepat di bawah Hero atau overlap sedikit */}
               <div className="-mt-8 relative z-10 px-2">
                 <DashboardSearch />
               </div>
            </div>
            
            {/* 2. Kategori (Data Real) */}
            <CategorySection categories={categoriesData as Category[] || []} />

            {/* 3. Produk Pilihan (Data Real - Urutan ditukar ke atas) */}
            <FeaturedProducts products={productsData as ProductWithDetails[] || []} />
            
            {/* 4. Aktivitas Saya (Hanya jika login - Urutan ditukar ke bawah) */}
            {userProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Kolom Kiri: Stats */}
                <div className="lg:col-span-1">
                   <h2 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Saya</h2>
                   <StatsSection activeOrderCount={activeOrderCount} />
                </div>
                
                {/* Kolom Kanan: Recent Orders */}
                <div className="lg:col-span-2">
                   <div className="flex justify-between items-end mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Pesanan Terakhir</h2>
                   </div>
                   {/* @ts-ignore */}
                   <RecentOrdersWidget orders={recentOrders} />
                </div>
              </div>
            )}

            {/* 5. Promo Banner (Paling bawah atau selingan) */}
            <PromoBanner />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Mutiara Bangsa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}