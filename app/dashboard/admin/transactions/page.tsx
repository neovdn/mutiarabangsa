import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { TransactionClient } from './transaction-client';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

async function getAllTransactions() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        full_name,
        no_telpon
      ),
      payments (
        method,
        payment_proof_url,
        status
      ),
      order_items (
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
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error.message);
    return [];
  }

  return data;
}

export default async function AdminTransactionsPage() {
  const transactions = await getAllTransactions();

  return (
    // Padding atas diubah menjadi pt-2 agar jarak ke navbar minimal
    <div className="-m-8 w-[calc(100%+4rem)] min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-8 pb-8 pt-2">
      <div className="container mx-auto max-w-6xl space-y-6">
        
        {/* Header Teks Dihapus */}

        <TransactionClient initialTransactions={transactions} />
        <Toaster />
      </div>
    </div>
  );
}