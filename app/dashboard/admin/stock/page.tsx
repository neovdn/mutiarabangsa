import SearchBar from '@/components/SearchBar';
import { Warehouse } from 'lucide-react'; // Menggunakan ikon baru

export default function AdminStockPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Kelola Stok Barang</h2>
        <p className="text-gray-600">
          Pantau dan perbarui ketersediaan stok produk Anda.
        </p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Konten Halaman Stok */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Warehouse className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-black mb-3">
            Manajemen Stok Barang
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Halaman ini akan berisi fitur untuk melihat, menambah, dan
            memperbarui stok barang secara *real-time*, serta melihat riwayat
            pergerakan stok.
          </p>
        </div>
      </div>
    </>
  );
}