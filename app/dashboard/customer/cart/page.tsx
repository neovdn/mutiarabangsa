'use client';

// Hapus semua logic auth, state, effect, dan sidebar

import { ShoppingCart } from 'lucide-react';

export default function CustomerCartPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Keranjang Belanja</h2>
        <p className="text-gray-600">Periksa item Anda sebelum checkout</p>
      </div>

      {/* Konten Halaman Keranjang */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-black" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Keranjang Anda Kosong
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Sepertinya Anda belum menambahkan produk apapun ke keranjang. Mulai
            jelajahi katalog untuk menemukan barang yang Anda butuhkan!
          </p>
        </div>
      </div>
    </>
  );
}