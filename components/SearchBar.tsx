'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="text"
        placeholder="Cari produk..."
        className="pl-10 py-6 border-2 border-gray-200 rounded-lg focus:border-cyan focus:ring-cyan"
      />
    </div>
  );
}
