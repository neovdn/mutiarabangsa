import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Kita tidak perlu 'use client' di sini jika hanya menampilkan info
export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_id: string };
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-100 to-cyan-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold text-black mb-3">
          Pesanan Berhasil Dibuat!
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Pesanan Anda (ID: ...{searchParams.order_id.slice(-6)}) telah kami
          terima dan sedang menunggu konfirmasi pembayaran.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8">
          Untuk saat ini, alur pengembangan selesai di sini. Nanti, halaman ini
          akan menampilkan instruksi pembayaran.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/customer/catalog">Kembali ke Katalog</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/customer/history">Lihat Riwayat Pesanan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}