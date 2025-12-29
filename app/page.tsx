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
import ChatWidget from '@/components/ai/ChatWidget';

// Definisi tipe lokal untuk cart item (sesuai kebutuhan Navbar)
type NavbarCartItem = {
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

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  
  // 1. Cek User Session
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile = null;
  let cartItems: NavbarCartItem[] = []; // <-- Ubah dari cartCount ke cartItems array
  let recentOrders: Order[] = [];
  let activeOrderCount = 0;

  // 2. Fetch Data Publik (Produk & Kategori)
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .limit(8);

  const { data: productsData } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .order('created_at', { ascending: false })
    .limit(12);

  // 3. Fetch Data Personal (Jika Login)
  if (user) {
    // Profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = profile;

    // --- PERBAIKAN DISINI: Fetch DETAIL Cart Items ---
    const { data: cartData } = await supabase
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
      .eq('user_id', user.id);
    
    // @ts-ignore
    cartItems = cartData || []; 

    // Pesanan Terbaru
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    // @ts-ignore
    recentOrders = orders || [];

    // Hitung Pesanan Aktif
    const { count: activeCount } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending_payment', 'waiting_confirmation', 'processing', 'shipped']);
    
    activeOrderCount = activeCount || 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Kirim cartItems, bukan cartCount */}
      <CustomerNavbar userProfile={userProfile} cartItems={cartItems} />
      
      <main className="flex-1 w-full">
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 md:px-8 md:py-8">
          <div className="container mx-auto space-y-6 max-w-7xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
               <DashboardHero />
               <div className="-mt-8 relative z-10 px-2">
                 <DashboardSearch />
               </div>
            </div>
            
            <CategorySection categories={categoriesData as Category[] || []} />

            <FeaturedProducts products={productsData as ProductWithDetails[] || []} />
            
            {userProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="lg:col-span-1">
                   <h2 className="text-xl font-bold text-gray-800 mb-4">Aktivitas Saya</h2>
                   <StatsSection activeOrderCount={activeOrderCount} />
                </div>
                
                <div className="lg:col-span-2">
                   <div className="flex justify-between items-end mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Pesanan Terakhir</h2>
                   </div>
                   {/* @ts-ignore */}
                   <RecentOrdersWidget orders={recentOrders} />
                </div>
              </div>
            )}

            <PromoBanner />
          </div>
        </div>
        <ChatWidget />
      </main>

      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Mutiara Bangsa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}