'use client';

import { Shirt, BookOpen, Pencil, ShoppingBag, ChevronRight } from 'lucide-react';

const categories = [
  { id: 1, name: 'Seragam', icon: Shirt, color: 'bg-blue-500', items: 45 },
  { id: 2, name: 'Buku', icon: BookOpen, color: 'bg-emerald-500', items: 120 },
  { id: 3, name: 'Alat Tulis', icon: Pencil, color: 'bg-amber-500', items: 80 },
  { id: 4, name: 'Tas', icon: ShoppingBag, color: 'bg-purple-500', items: 32 },
];

export function CategorySection() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Kategori Populer</h2>
        <button className="text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1 text-sm">
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className={`${category.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 text-lg">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.items} produk</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}