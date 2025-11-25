import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Category } from '@/types/product'; // <-- TAMBAHKAN IMPORT INI

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TAMBAHKAN TIPE DAN FUNGSI BARU DI BAWAH INI ---

export interface ProcessedCategory {
  id: string;
  name: string; // Akan berisi "Induk > Anak"
}

// Helper function untuk memproses kategori
export function processCategories(categories: Category[]): ProcessedCategory[] {
  // 1. Buat Map untuk mencari nama kategori berdasarkan ID
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
  
  // 2. Buat Set (daftar unik) dari semua ID yang merupakan 'parent_id'
  const parentIds = new Set<string>();
  for (const cat of categories) {
    if (cat.parent_id) {
      parentIds.add(cat.parent_id);
    }
  }

  const processed: ProcessedCategory[] = [];

  // 3. Iterasi semua kategori
  for (const cat of categories) {
    // 4. HANYA tampilkan kategori yang BUKAN merupakan induk
    if (!parentIds.has(cat.id)) {
      let displayName = cat.name;
      
      // 5. Jika dia kategori "daun" TAPI punya induk, buat format "Induk > Anak"
      if (cat.parent_id) {
        const parentName = categoryMap.get(cat.parent_id);
        if (parentName) {
          displayName = `${parentName} > ${cat.name}`;
        }
      }
      
      processed.push({
        id: cat.id,
        name: displayName,
      });
    }
  }

  // 6. Urutkan berdasarkan nama untuk tampilan yang rapi
  return processed.sort((a, b) => a.name.localeCompare(b.name));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};