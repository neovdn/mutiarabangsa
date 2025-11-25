import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { OrderWithDetails } from '@/types/order';
import { HistoryClient } from './history-client';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

async function getOrderHistory(): Promise<OrderWithDetails[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        price_at_purchase,
        product_variants (
          size,
          products (
            name,
            image_url
          )
        )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching order history:', error.message);
    return [];
  }
  // @ts-ignore
  return data as OrderWithDetails[];
}

export default async function CustomerHistoryPage() {
  const orders = await getOrderHistory();

  return (
    <>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-black mb-2">Riwayat Transaksi</h2>
        <p className="text-gray-600">Pantau status pesanan dan riwayat belanja Anda</p>
      </div>
      
      <HistoryClient initialOrders={orders} />
      <Toaster />
    </>
  );
}