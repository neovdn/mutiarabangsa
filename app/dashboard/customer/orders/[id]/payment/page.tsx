import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { notFound, redirect } from 'next/navigation';
import { PaymentClient } from './payment-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, CreditCard } from 'lucide-react';

// Helper currency
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
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  if (order.status !== 'pending_payment') {
    redirect('/dashboard/customer/history');
  }

  // Cek pembayaran existing
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('order_id', order.id)
    .single();

  if (existingPayment) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Sedang Diverifikasi</CardTitle>
            <CardDescription>
              Kami telah menerima bukti pembayaran Anda. Mohon tunggu verifikasi admin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 2. Ambil Data Profil untuk Pre-fill Alamat
  const { data: profile } = await supabase
    .from('profiles')
    .select('address_street, address_city, address_province, address_postal_code')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
        <p className="text-sm text-gray-500">Lengkapi data pengiriman dan pembayaran.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* KOLOM KIRI (UTAMA): FORM (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentClient 
            orderId={order.id} 
            amount={order.total_amount} 
            initialAddress={profile} 
          />
        </div>

        {/* KOLOM KANAN: RINGKASAN (Span 1) - Sticky */}
        <div className="lg:col-span-1 sticky top-24">
          <Card className="bg-gray-50/50 border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />
                Ringkasan Pesanan
              </CardTitle>
              <CardDescription className="text-xs">ID: #{order.id.slice(0, 8)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {order.order_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm group">
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 line-clamp-1">{item.product_variants?.products?.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {item.product_variants?.size} <span className="mx-1">•</span> x{item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900 tabular-nums">
                      {formatIDR(item.price_at_purchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator className="bg-gray-200" />
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal Produk</span>
                  <span>{formatIDR(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Biaya Layanan</span>
                  <span>Rp 0</span>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-gray-900">Total Tagihan</span>
                <span className="font-bold text-lg text-cyan-600">{formatIDR(order.total_amount)}</span>
              </div>
              
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                <CreditCard className="h-3 w-3" />
                <span>Pembayaran Aman & Terenkripsi</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}