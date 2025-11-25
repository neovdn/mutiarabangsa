import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import CustomerNavbar from '@/components/CustomerNavbar';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DashboardSearch } from '@/components/dashboard/dashboard-search';
import { CategorySection } from '@/components/dashboard/category-section';
import { StatsSection } from '@/components/dashboard/stats-section';
import { RecentOrdersWidget } from '@/components/dashboard/recent-orders-widget';
import { FeaturedProducts } from '@/components/dashboard/featured-products';
import { PromoBanner } from '@/components/dashboard/promo-banner';

// Pastikan halaman ini selalu dinamis karena bergantung pada Auth
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  
  // 1. Cek User Session
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  let cartCount = 0;

  // 2. Jika Login: Ambil Profil & Keranjang
  if (user) {
    // Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    userProfile = profile;

    // Fetch Cart Count
    const { count } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
      
    cartCount = count || 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Global dengan Logika Login/Guest */}
      <CustomerNavbar userProfile={userProfile} cartCount={cartCount} />
      
      <main className="flex-1 w-full">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8 md:px-8 md:py-12">
          <div className="container mx-auto space-y-12 max-w-7xl">
            
            {/* Hero Section */}
            <DashboardHero />
            
            {/* Search & Filter */}
            <DashboardSearch />
            
            {/* Kategori */}
            <CategorySection />
            
            {/* Widget Personal (Stats & Recent Orders).
              Hanya tampilkan jika user login.
            */}
            {userProfile && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Aktivitas Saya</h2>
                  <p className="text-gray-500">Ringkasan belanja Anda</p>
                </div>
                <StatsSection />
                <RecentOrdersWidget />
              </div>
            )}

            {/* Produk & Promo (Tampil untuk semua) */}
            <FeaturedProducts />
            
            <PromoBanner />
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Mutiara Bangsa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}