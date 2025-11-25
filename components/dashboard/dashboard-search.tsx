'use client';

import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

export function DashboardSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 border border-gray-100">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk, kategori, atau merek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
    </div>
  );
}