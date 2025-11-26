import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { notFound, redirect } from 'next/navigation';
import { PaymentClient } from './payment-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, CreditCard, CheckCircle2 } from 'lucide-react';
import Image from 'next/image'; // Pastikan Image diimport

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
          products (name, image_url)
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

  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('order_id', order.id)
    .single();

  if (existingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-2xl border-gray-100 shadow-lg text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 mb-2">Pembayaran Sedang Diverifikasi</CardTitle>
          <CardDescription className="text-gray-500">
            Kami telah menerima bukti pembayaran Anda. Mohon tunggu verifikasi admin 1x24 jam.
          </CardDescription>
        </Card>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('no_telpon, address_street, address_city, address_province, address_postal_code')
    .eq('id', user.id)
    .single();

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
             <CreditCard className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pembayaran</h2>
            <p className="text-sm text-gray-500">Selesaikan pembayaran untuk memproses pesanan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* KOLOM KIRI: FORM (Span 2) */}
          <div className="lg:col-span-2">
            {/* PaymentClient menangani layout cardnya sendiri */}
            <PaymentClient 
              orderId={order.id} 
              amount={order.total_amount} 
              initialData={profile} 
            />
          </div>

          {/* KOLOM KANAN: RINGKASAN (Span 1) - Sticky */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <CardHeader className="pb-4 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-800">
                  <ShoppingBag className="h-4 w-4 text-cyan-600" />
                  Ringkasan Pesanan
                </CardTitle>
                <CardDescription className="text-xs">ID: #{order.id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.order_items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      
                      {/* GAMBAR PRODUK DIPERBAIKI */}
                      <div className="h-12 w-12 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden relative">
                         <Image 
                            src={item.product_variants?.products?.image_url || '/img/placeholder.png'}
                            alt={item.product_variants?.products?.name || 'Product'}
                            fill
                            className="object-cover"
                         />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">
                          {item.product_variants?.products?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {item.product_variants?.size} • {item.quantity}x
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-700 tabular-nums">
                          {formatIDR(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium">{formatIDR(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Biaya Pengiriman</span>
                    <span className="font-medium text-cyan-600">Gratis</span>
                  </div>
                </div>

                <Separator className="bg-dashed" />

                <div className="flex justify-between items-end pt-2">
                  <span className="font-bold text-base text-gray-900">Total Tagihan</span>
                  <span className="font-bold text-xl text-[#E8207E]">{formatIDR(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}