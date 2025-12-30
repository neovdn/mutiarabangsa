import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { ReportsClient } from './reports-client';
import { Toaster } from '@/components/ui/toaster';
import { startOfYear, endOfYear } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getSalesData(startDate: Date, endDate: Date) {
  const supabase = createSupabaseServerClient();
  const { data: dailySales, error } = await supabase
    .from('orders')
    .select('created_at, total_amount, status')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed', 'shipped', 'processing']);

  if (error) return { dailySales: [], totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

  const totalRevenue = dailySales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  return {
    dailySales: dailySales || [],
    totalRevenue,
    totalOrders: dailySales?.length || 0,
    avgOrderValue: dailySales?.length ? totalRevenue / dailySales.length : 0,
  };
}

async function getStockData() {
    // Gunakan fungsi getStockData dari file original kamu
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('product_variants').select('*, products(name, categories(name))').order('stock');
    if(error) return { variants: [], lowStockCount: 0, outOfStockCount: 0, totalValue: 0 };
    
    const lowStockCount = data?.filter(v => v.stock > 0 && v.stock < 10).length || 0;
    const outOfStockCount = data?.filter(v => v.stock === 0).length || 0;
    const totalValue = data?.reduce((sum, v) => sum + (v.stock * v.price), 0) || 0;
    return { variants: data || [], lowStockCount, outOfStockCount, totalValue };
}

async function getTopCategories(startDate: Date, endDate: Date) {
    // Gunakan fungsi getTopCategories dari file original kamu
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('order_items')
    .select(`quantity, price_at_purchase, product_variants!inner(products!inner(categories(id, name))), orders!inner(created_at, status)`)
    .gte('orders.created_at', startDate.toISOString()).lte('orders.created_at', endDate.toISOString())
    .in('orders.status', ['completed', 'shipped', 'processing']);

    const categoryMap = new Map();
    data?.forEach((item: any) => {
        const cat = item.product_variants?.products?.categories;
        if(!cat) return;
        if(!categoryMap.has(cat.id)) categoryMap.set(cat.id, { ...cat, totalRevenue: 0 });
        categoryMap.get(cat.id).totalRevenue += item.quantity * item.price_at_purchase;
    });
    return Array.from(categoryMap.values()).sort((a,b) => b.totalRevenue - a.totalRevenue).slice(0,5);
}


// --- FOKUS PERBAIKAN: getTopProducts ---
async function getTopProducts(startDate: Date, endDate: Date) {
  const supabase = createSupabaseServerClient();

  // Kita gunakan select yang pasti
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price_at_purchase,
      product_variants!inner (
        id,
        product_id,
        products!inner (
          id,
          name,
          image_url
        )
      ),
      orders!inner (
        created_at,
        status
      )
    `)
    .gte('orders.created_at', startDate.toISOString())
    .lte('orders.created_at', endDate.toISOString())
    .in('orders.status', ['completed', 'shipped', 'processing']);

  if (error) {
    console.error('Error fetching top products:', error);
    return [];
  }

  const productMap = new Map();

  data?.forEach((item: any) => {
    // Pastikan navigasi object aman
    const product = item.product_variants?.products;
    
    if (!product) return;

    const key = product.id; // Grouping by Product ID (Induk), bukan Variant ID
    
    if (!productMap.has(key)) {
      productMap.set(key, {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        totalQuantity: 0,
        totalRevenue: 0,
      });
    }

    const existing = productMap.get(key);
    existing.totalQuantity += item.quantity;
    existing.totalRevenue += item.quantity * item.price_at_purchase;
  });

  // Debugging (Opsional: Cek di terminal server)
  // console.log(`Found ${productMap.size} unique products in range.`);

  return Array.from(productMap.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string };
}) {
  const now = new Date();
  
  const startDate = searchParams.start 
    ? new Date(searchParams.start) 
    : startOfYear(now);
    
  const endDate = searchParams.end 
    ? new Date(searchParams.end) 
    : endOfYear(now);

  const [salesData, topProducts, stockData, topCategories] = await Promise.all([
    getSalesData(startDate, endDate),
    getTopProducts(startDate, endDate),
    getStockData(),
    getTopCategories(startDate, endDate),
  ]);

  return (
    <div className="-m-8 w-[calc(100%+4rem)] min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-8 pb-8 pt-2">
      <div className="container mx-auto max-w-[1400px]">
        <ReportsClient
          initialSalesData={salesData}
          initialTopProducts={topProducts}
          initialStockData={stockData}
          initialTopCategories={topCategories}
          initialStartDate={startDate.toISOString()}
          initialEndDate={endDate.toISOString()}
        />
        <Toaster />
      </div>
    </div>
  );
}