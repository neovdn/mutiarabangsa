/*
 * File dimodifikasi: app/dashboard/admin/page.tsx
 * Deskripsi: Disederhanakan, logika auth & layout dihapus.
 */
import SearchBar from '@/components/SearchBar';
import { LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Dashboard Admin</h2>
        <p className="text-gray-600">Kelola toko perlengkapan sekolah Anda</p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Selamat Datang di Dashboard Admin
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Gunakan menu di navbar untuk mengelola produk, melihat transaksi,
            dan mengakses laporan toko.
          </p>
        </div>
      </div>
    </>
  );
}