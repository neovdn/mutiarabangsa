'use client';

import { Package, ShoppingBag } from 'lucide-react';

interface StatsSectionProps {
  activeOrderCount: number;
}

export function StatsSection({ activeOrderCount }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Card Aktif */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">Pesanan Berjalan</p>
          <p className="text-2xl font-bold text-blue-600">{activeOrderCount}</p>
        </div>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Card Info Lain (Optional Placeholder) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-cyan-100 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">Siap Belanja?</p>
          <p className="text-xs text-gray-400">Cek promo terbaru hari ini</p>
        </div>
        <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-cyan-600" />
        </div>
      </div>
    </div>
  );
}