'use client';

import Link from 'next/link';
import { Category } from '@/types/product';
import { 
  LayoutGrid, 
  Shirt, 
  Book, 
  PenTool, 
  Backpack, 
  ChevronRight,
  Award,       // Untuk Atribut/Dasi (Badge/Ribbon like)
  Scissors,    // Untuk Celana/Rok (Tailoring)
  Circle,      // Untuk Ikat Pinggang (Belt shape)
  Footprints,  // Untuk Kaus Kaki
  Library      // Alternatif Buku
} from 'lucide-react';

// Helper mapping icon yang lebih spesifik
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  
  // 1. Kemeja & Atasan
  if (n.includes('kemeja') || n.includes('atasan') || n.includes('seragam')) return Shirt;
  
  // 2. Celana & Rok (Menggunakan Scissors/Gunting sebagai simbol jahit/tailor)
  if (n.includes('celana') || n.includes('rok') || n.includes('bawahan')) return Scissors;
  
  // 3. Atribut & Dasi (Menggunakan Award/Badge)
  if (n.includes('atribut') || n.includes('dasi') || n.includes('topi')) return Award;
  
  // 4. Ikat Pinggang (Menggunakan Circle)
  if (n.includes('ikat pinggang') || n.includes('sabuk')) return Circle;
  
  // 5. Kaus Kaki & Sepatu
  if (n.includes('kaus kaki') || n.includes('sepatu')) return Footprints;
  
  // 6. Perlengkapan Sekolah Lain
  if (n.includes('buku') || n.includes('modul')) return Book;
  if (n.includes('alat') || n.includes('tulis')) return PenTool;
  if (n.includes('tas')) return Backpack;
  
  // Default
  return LayoutGrid;
};

const getCategoryColor = (index: number) => {
  // Warna-warna cerah untuk sekolah
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'
  ];
  return colors[index % colors.length];
};

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Kategori</h2>
        <Link 
          href="/dashboard/customer/catalog" 
          className="text-[#E8207E] font-medium hover:text-[#E8207E]/80 flex items-center gap-1 text-sm"
        >
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((category, idx) => {
          const Icon = getCategoryIcon(category.name);
          const colorClass = getCategoryColor(idx);
          
          return (
            <Link
              key={category.id}
              href={`/dashboard/customer/catalog?category=${category.id}`}
              className="group bg-white rounded-xl p-3 border border-gray-100 hover:border-cyan-300 hover:shadow-md transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className={`${colorClass} w-10 h-10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700 text-xs line-clamp-1 w-full" title={category.name}>
                {category.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </div>
  );
}