'use client';

import { Package, TrendingUp, Star } from 'lucide-react';

export function StatsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Package className="w-8 h-8 opacity-80" />
          <span className="text-2xl font-bold">2</span>
        </div>
        <p className="text-blue-100 font-medium">Pesanan Aktif</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-8 h-8 opacity-80" />
          <span className="text-2xl font-bold">12</span>
        </div>
        <p className="text-emerald-100 font-medium">Wishlist Items</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Star className="w-8 h-8 opacity-80" />
          <span className="text-2xl font-bold">4.8</span>
        </div>
        <p className="text-amber-100 font-medium">Rating Anda</p>
      </div>
    </div>
  );
}