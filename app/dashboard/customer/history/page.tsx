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
    // Background Gradient Konsisten
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-4">
        <HistoryClient initialOrders={orders} />
        <Toaster />
      </div>
    </div>
  );
}