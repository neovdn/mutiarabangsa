'use client';

// Hapus import SearchBar jika tidak terpakai
// import SearchBar from '@/components/SearchBar';
import { History } from 'lucide-react';

export default function CustomerHistoryPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Riwayat Pesanan</h2>
        <p className="text-gray-600">Lihat semua transaksi Anda sebelumnya</p>
      </div>

      {/* <div className="mb-8">
        <SearchBar />
      </div> */}

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <History className="h-12 w-12 text-black" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Belum Ada Riwayat Pesanan
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Semua pesanan yang telah Anda selesaikan akan muncul di sini. Mari
            mulai belanja di halaman katalog!
          </p>
        </div>
      </div>
    </>
  );
}