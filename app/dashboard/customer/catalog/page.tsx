'use client';

import SearchBar from '@/components/SearchBar';
import { Store } from 'lucide-react';

export default function CustomerCatalogPage() {
  // Ini adalah konten dari file app/dashboard/customer/page.tsx Anda sebelumnya
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Katalog Produk</h2>
        <p className="text-gray-600">
          Temukan perlengkapan sekolah yang Anda butuhkan
        </p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Store className="h-12 w-12 text-black" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Selamat Berbelanja!
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Gunakan menu di navbar untuk menjelajahi katalog produk, mengelola
            keranjang belanja, dan melihat riwayat pesanan Anda.
          </p>
        </div>
      </div>
    </>
  );
}