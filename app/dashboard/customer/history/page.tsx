import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Order } from '@/types/order'; // Impor tipe baru

// Helper format mata uang (Harga disimpan sebagai integer)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Ambil data pesanan
async function getOrderHistory(): Promise<Order[]> {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*') // Anda bisa join order_items di sini jika perlu detail
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching order history:', error.message);
    return [];
  }
  return data as Order[];
}

export default async function CustomerHistoryPage() {
  const orders = await getOrderHistory();

  // Helper untuk memetakan status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Menunggu Pembayaran';
      case 'processing':
        return 'Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Riwayat Pesanan</h2>
        <p className="text-gray-600">Lihat semua transaksi Anda sebelumnya</p>
      </div>

      {orders.length === 0 ? (
        // Tampilan Kosong
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <History className="h-12 w-12 text-black" />
            </div>
            <h3 className="text-2xl font-semibold text-black mb-3">
              Belum Ada Riwayat Pesanan
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Semua pesanan yang telah Anda selesaikan akan muncul di sini.
            </p>
          </div>
        </div>
      ) : (
        // Tampilan Daftar Pesanan
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pesanan #{order.id.slice(0, 8)}...
                </CardTitle>
                <CardDescription>
                  Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Badge variant={order.status === 'pending_payment' ? 'destructive' : 'secondary'}>
                  {getStatusLabel(order.status)}
                </Badge>
                <span className="font-bold text-lg">
                  {/* Gunakan total_amount */}
                  {formatCurrency(order.total_amount)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}