import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderWithDetails } from '@/types/order'; // <-- Ganti impor
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

// Helper format mata uang (Harga disimpan sebagai integer)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Ambil data pesanan
async function getOrderHistory(): Promise<OrderWithDetails[]> { // <-- Ganti tipe
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // --- MODIFIKASI QUERY DI SINI ---
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
  // --- BATAS MODIFIKASI ---

  if (error) {
    console.error('Error fetching order history:', error.message);
    return [];
  }
  return data as OrderWithDetails[];
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
          {/* ... (Tampilan kosong tetap sama) ... */}
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
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
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
                </div>
                <Badge variant={order.status === 'pending_payment' ? 'destructive' : 'secondary'}>
                  {getStatusLabel(order.status)}
                </Badge>
              </CardHeader>
              
              {/* --- KONTEN BARU: DAFTAR ITEM --- */}
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {order.order_items.map((item) => {
                    const variant = item.product_variants;
                    const product = variant?.products;
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <Image
                          src={product?.image_url || '/img/placeholder.png'}
                          alt={product?.name || 'Produk'}
                          width={48}
                          height={48}
                          className="rounded-md object-cover w-12 h-12"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product?.name || 'Produk Dihapus'}</p>
                          <p className="text-sm text-muted-foreground">
                            Size: {variant?.size || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.price_at_purchase)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            x {item.quantity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              {/* --- BATAS KONTEN BARU --- */}

              <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
                <span className="font-semibold">Total Pesanan</span>
                <span className="font-bold text-lg">
                  {formatCurrency(order.total_amount)}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}