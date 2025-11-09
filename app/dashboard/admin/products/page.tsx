/*
 * File dimodifikasi: app/dashboard/admin/products/page.tsx
 * Deskripsi: Disederhanakan, logika auth & layout dihapus.
 */
import SearchBar from '@/components/SearchBar';
import { Package } from 'lucide-react';

export default function AdminProductsPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Kelola Produk</h2>
        <p className="text-gray-600">
          Tambah, edit, dan atur semua produk toko Anda
        </p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Konten Halaman Produk */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Manajemen Produk
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Gunakan halaman ini untuk menambah, mengedit, dan menghapus produk.
            Anda juga dapat mengelola stok dan kategori.
          </p>
        </div>
      </div>
    </>
  );
}