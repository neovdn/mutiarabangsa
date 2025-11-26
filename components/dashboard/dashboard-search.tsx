'use client';

import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DashboardSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/customer/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-xl p-2 border border-gray-100 max-w-4xl mx-auto">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          {/* Input height dikurangi (py-2) */}
          <input
            type="text"
            placeholder="Cari seragam, buku, atau alat tulis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-medium focus:outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
        <button 
          type="button"
          onClick={() => router.push('/dashboard/customer/catalog')}
          className="hidden sm:flex px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 rounded-lg transition-all items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Katalog
        </button>
        <button 
          type="submit"
          className="px-5 py-2 bg-[#E8207E] text-white text-sm rounded-lg font-medium hover:bg-[#E8207E]/90 transition-all shadow-sm"
        >
          Cari
        </button>
      </div>
    </form>
  );
}