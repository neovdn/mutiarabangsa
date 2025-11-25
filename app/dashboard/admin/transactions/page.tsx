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
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Manajemen Transaksi</h2>
        <p className="text-gray-600">
          Verifikasi pembayaran dan atur pengiriman pesanan pelanggan.
        </p>
      </div>

      <TransactionClient initialTransactions={transactions} />
      <Toaster />
    </>
  );
}