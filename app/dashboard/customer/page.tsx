'use client';

import SearchBar from '@/components/SearchBar';
import { LayoutDashboard } from 'lucide-react'; // <-- Ganti icon

export default function CustomerDashboard() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Selamat datang! Lihat status pesanan dan katalog produk.
        </p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Konten Halaman Dashboard Customer */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          {/* Ganti ikon dan warna gradien */}
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Selamat Datang di Mutiara Bangsa
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Gunakan menu di atas untuk menjelajahi <b>Katalog</b>,
            melihat <b>Keranjang</b> belanja Anda, atau mengecek <b>Riwayat Pesanan</b>.
          </p>
        </div>
      </div>
    </>
  );
}