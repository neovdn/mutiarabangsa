'use client';

import { ChevronRight, Plus, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock Data Produk
const featuredProducts = [
  {
    id: 1,
    name: 'Seragam Putih Lengan Pendek',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop',
    category: 'Seragam',
    rating: 4.8,
    stock: 15,
    badge: 'Populer'
  },
  {
    id: 2,
    name: 'Buku Matematika Kelas 10',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
    category: 'Buku',
    rating: 4.9,
    stock: 28,
    badge: 'Terlaris'
  },
  {
    id: 3,
    name: 'Set Alat Tulis Premium',
    price: 150000,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop',
    category: 'Alat Tulis',
    rating: 4.7,
    stock: 42,
    badge: 'Promo'
  },
  {
    id: 4,
    name: 'Tas Ransel Sekolah',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Tas',
    rating: 4.6,
    stock: 8,
    badge: null
  },
  {
    id: 5,
    name: 'Sepatu Olahraga Hitam',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Sepatu',
    rating: 4.9,
    stock: 12,
    badge: 'Baru'
  },
  {
    id: 6,
    name: 'Pensil 2B Paket 12',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop',
    category: 'Alat Tulis',
    rating: 4.5,
    stock: 150,
    badge: null
  }
];

export function FeaturedProducts() {
  const getBadgeColor = (badge: string | null) => {
    switch(badge) {
      case 'Populer': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'Terlaris': return 'bg-gradient-to-r from-pink-500 to-rose-500';
      case 'Promo': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'Baru': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Produk Pilihan</h2>
        <button className="text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1 text-sm">
          Lihat Katalog
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-cyan-300 hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {/* Note: Di tahap selanjutnya ganti img dengan next/image */}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {product.badge && (
                <div className={`absolute top-3 left-3 px-3 py-1 ${getBadgeColor(product.badge)} text-white text-xs font-bold rounded-full shadow-lg`}>
                  {product.badge}
                </div>
              )}
              <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-600 hover:text-white">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-xs text-gray-400 ml-auto">Stok: {product.stock}</span>
              </div>

              <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm leading-tight">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                  <p className="font-bold text-cyan-600 text-base">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}