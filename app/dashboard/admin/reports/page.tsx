import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { ReportsClient } from './reports-client';
import { Toaster } from '@/components/ui/toaster';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const dynamic = 'force-dynamic';

// Fungsi untuk mengambil data laporan penjualan
async function getSalesData(startDate: Date, endDate: Date) {
  const supabase = createSupabaseServerClient();

  // Data penjualan per hari
  // NOTE: Pastikan data di database memiliki status 'completed', 'shipped', atau 'processing'
  const { data: dailySales, error: salesError } = await supabase
    .from('orders')
    .select('created_at, total_amount, status')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['completed', 'shipped', 'processing']);

  if (salesError) {
    console.error('Error fetching sales:', salesError);
    return { dailySales: [], totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
  }

  // Hitung metrik
  const totalRevenue = dailySales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const totalOrders = dailySales?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    dailySales: dailySales || [],
    totalRevenue,
    totalOrders,
    avgOrderValue,
  };
}

// Fungsi untuk mengambil produk terlaris
async function getTopProducts(startDate: Date, endDate: Date) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price_at_purchase,
      product_variants (
        id,
        size,
        products (
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

  // Agregasi data produk
  const productMap = new Map();

  data?.forEach((item: any) => {
    // Pastikan struktur data valid
    const variant = item.product_variants;
    const product = variant?.products;
    
    if (!product) return;

    // Gunakan ID Variant atau ID Produk sebagai key (disini pakai ID produk untuk group per produk)
    const key = product.id; 
    
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

  return Array.from(productMap.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);
}

// Fungsi untuk mengambil data stok
async function getStockData() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id,
      size,
      stock,
      price,
      products (
        id,
        name,
        categories (
          name
        )
      )
    `)
    .order('stock', { ascending: true });

  if (error) {
    console.error('Error fetching stock data:', error);
    return { variants: [], lowStockCount: 0, outOfStockCount: 0, totalValue: 0 };
  }

  const lowStockCount = data?.filter(v => v.stock > 0 && v.stock < 10).length || 0;
  const outOfStockCount = data?.filter(v => v.stock === 0).length || 0;
  const totalValue = data?.reduce((sum, v) => sum + (v.stock * v.price), 0) || 0;

  return {
    variants: data || [],
    lowStockCount,
    outOfStockCount,
    totalValue,
  };
}

// Fungsi untuk kategori terlaris
async function getTopCategories(startDate: Date, endDate: Date) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      price_at_purchase,
      product_variants (
        products (
          categories (
            id,
            name
          )
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
    console.error('Error fetching categories:', error);
    return [];
  }

  const categoryMap = new Map();

  data?.forEach((item: any) => {
    const category = item.product_variants?.products?.categories;
    if (!category) return;

    const key = category.id;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        id: category.id,
        name: category.name,
        totalQuantity: 0,
        totalRevenue: 0,
      });
    }

    const existing = categoryMap.get(key);
    existing.totalQuantity += item.quantity;
    existing.totalRevenue += item.quantity * item.price_at_purchase;
  });

  return Array.from(categoryMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string };
}) {
  const now = new Date();
  
  // LOGIC FIX: Default ke Tahun Ini (startOfYear) agar data lama terlihat, bukan Bulan Ini
  // Kecuali user memilih tanggal spesifik via filter
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

  // LAYOUT FIX: Menghapus div wrapper -m-8 (negative margin) yang membuat layout melebar aneh
  return (
    <div className="space-y-6">
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
  );
}