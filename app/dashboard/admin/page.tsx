import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, ShoppingBag, AlertTriangle, ArrowUpRight, ArrowRight, Package, Warehouse, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createSupabaseServerClient();

  // 1. Fetch Data Statistik
  // Total Pendapatan (Status: completed)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'completed');
  
  const totalRevenue = revenueData?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;

  // Total Pesanan
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Total Produk
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // Produk Low Stock (< 10)
  const { data: lowStockVariants } = await supabase
    .from('product_variants')
    .select('stock')
    .lt('stock', 10);
  
  const lowStockCount = lowStockVariants?.length || 0;

  // 2. Fetch Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id, 
      status, 
      total_amount, 
      created_at,
      profiles (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    // -m-8 digunakan untuk menimpa padding p-8 dari layout parent (AdminDashboardLayout)
    // min-h-[calc(100vh-5rem)] memastikan background mengisi sisa tinggi layar (dikurangi tinggi navbar approx)
    <div className="-m-8 min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      
      <div className="container mx-auto max-w-[1400px] space-y-6">

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Card 1: Pendapatan (Pink Accent) */}
           <Card className="border-l-4 border-l-[#E8207E] shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                       <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                       <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</h3>
                    </div>
                    <div className="p-2 bg-pink-50 rounded-lg text-[#E8207E]">
                       <DollarSign className="h-5 w-5" />
                    </div>
                 </div>
                 <div className="flex items-center text-xs text-green-600 font-medium">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> +12% dari bulan lalu
                 </div>
              </CardContent>
           </Card>

           {/* Card 2: Pesanan (Cyan Accent) */}
           <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                       <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
                       <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</h3>
                    </div>
                    <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                       <ShoppingBag className="h-5 w-5" />
                    </div>
                 </div>
                 <div className="flex items-center text-xs text-gray-400">
                    Semua pesanan masuk
                 </div>
              </CardContent>
           </Card>

           {/* Card 3: Produk (Blue Accent) */}
           <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                       <p className="text-sm font-medium text-gray-500">Total Produk</p>
                       <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                       <Package className="h-5 w-5" />
                    </div>
                 </div>
                 <div className="flex items-center text-xs text-gray-400">
                    Item aktif di katalog
                 </div>
              </CardContent>
           </Card>

           {/* Card 4: Low Stock (Amber Warning) */}
           <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
              <CardContent className="p-5">
                 <div className="flex justify-between items-start mb-2">
                    <div>
                       <p className="text-sm font-medium text-gray-500">Stok Menipis</p>
                       <h3 className="text-2xl font-bold text-gray-900 mt-1">{lowStockCount}</h3>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                       <AlertTriangle className="h-5 w-5" />
                    </div>
                 </div>
                 <div className="flex items-center text-xs text-amber-600 font-medium cursor-pointer hover:underline">
                    <Link href="/dashboard/admin/stock">Lihat detail stok</Link>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* RECENT TRANSACTIONS & QUICK ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Tabel Transaksi (Kolom Besar) */}
           <div className="lg:col-span-2">
              <Card className="border-gray-100 shadow-sm bg-white">
                 <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center justify-between">
                       <div>
                          <CardTitle className="text-lg font-bold text-gray-800">Transaksi Terbaru</CardTitle>
                          <CardDescription>5 pesanan terakhir yang masuk</CardDescription>
                       </div>
                       <Link href="/dashboard/admin/transactions">
                          <Button variant="outline" size="sm" className="text-xs text-cyan-700 border-cyan-200 hover:bg-cyan-50">
                             Lihat Semua <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                       </Link>
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                             <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Pelanggan</th>
                                <th className="px-6 py-3 font-medium">Total</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {recentOrders?.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-6 py-4 font-medium text-gray-900">
                                      #{order.id.slice(0, 8)}
                                   </td>
                                   <td className="px-6 py-4 text-gray-600">
                                      {order.profiles?.full_name || 'Guest'}
                                   </td>
                                   <td className="px-6 py-4 font-medium text-[#E8207E]">
                                      {formatCurrency(order.total_amount)}
                                   </td>
                                   <td className="px-6 py-4">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                         ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                           order.status === 'pending_payment' ? 'bg-red-100 text-red-800' :
                                           'bg-blue-100 text-blue-800'}`}>
                                         {order.status.replace('_', ' ')}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                             {(!recentOrders || recentOrders.length === 0) && (
                                <tr>
                                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                      Belum ada transaksi terbaru.
                                   </td>
                                </tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Quick Actions (Kolom Kecil) */}
           <div className="lg:col-span-1">
              <Card className="border-gray-100 shadow-sm h-full bg-white">
                 <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800">Akses Cepat</CardTitle>
                 </CardHeader>
                 <CardContent className="grid gap-3">
                    <Link href="/dashboard/admin/products?action=add">
                       <Button variant="outline" className="w-full justify-start h-12 text-gray-600 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 bg-white">
                          <Package className="mr-2 h-4 w-4 text-cyan-600" />
                          Tambah Produk Baru
                       </Button>
                    </Link>
                    <Link href="/dashboard/admin/stock">
                       <Button variant="outline" className="w-full justify-start h-12 text-gray-600 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 bg-white">
                          <Warehouse className="mr-2 h-4 w-4 text-cyan-600" />
                          Cek Stok Barang
                       </Button>
                    </Link>
                    <Link href="/dashboard/admin/reports">
                       <Button variant="outline" className="w-full justify-start h-12 text-gray-600 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 bg-white">
                          <BarChart3 className="mr-2 h-4 w-4 text-cyan-600" />
                          Lihat Laporan Bulanan
                       </Button>
                    </Link>
                 </CardContent>
              </Card>
           </div>

        </div>
      </div>
    </div>
  );
}