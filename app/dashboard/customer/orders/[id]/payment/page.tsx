import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { notFound, redirect } from 'next/navigation';
import { PaymentClient } from './payment-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Helper currency jika belum ada di utils global
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

interface PageProps {
  params: { id: string };
}

export default async function PaymentPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Ambil Detail Pesanan
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price_at_purchase,
        product_variants (
          size,
          products (name)
        )
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id) // Pastikan user hanya bisa melihat ordernya sendiri
    .single();

  if (error || !order) {
    notFound();
  }

  // Jika pesanan sudah dibayar atau status bukan pending_payment, redirect
  if (order.status !== 'pending_payment') {
    redirect('/dashboard/customer/history');
  }

  // Cek apakah sudah ada pembayaran pending (menghindari double submit)
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('order_id', order.id)
    .single();

  if (existingPayment) {
    // Jika sudah bayar tapi belum diverifikasi admin
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Sedang Diverifikasi</CardTitle>
            <CardDescription>
              Kami telah menerima bukti pembayaran Anda untuk pesanan ini. Mohon tunggu verifikasi admin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Pembayaran</h2>
        <p className="text-gray-600">Selesaikan pembayaran untuk memproses pesanan Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kolom Kiri: Ringkasan Pesanan */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
            <CardDescription>Order ID: #{order.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {order.order_items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.product_variants?.products?.name} ({item.product_variants?.size}) x{item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatIDR(item.price_at_purchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Tagihan</span>
              <span className="text-cyan-600">{formatIDR(order.total_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Kolom Kanan: Form Pembayaran (Client Component) */}
        <div>
          <PaymentClient orderId={order.id} amount={order.total_amount} />
        </div>
      </div>
    </div>
  );
}