/*
 * File dimodifikasi: app/dashboard/admin/stock/page.tsx
 * Deskripsi: Memastikan query select mengambil semua ID yang diperlukan.
 */
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { StockClient, VariantWithProduct } from './stock-client'; // <-- Impor tipe baru
import { Toaster } from '@/components/ui/toaster';
import { Category } from '@/types/product';

export const dynamic = 'force-dynamic';

// Tipe sederhana untuk dropdown
type SimpleProduct = {
  id: string;
  name: string;
};

// 1. Ambil semua varian (data utama)
async function getStockData(): Promise<VariantWithProduct[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select(
      `
      *,
      products (
        id, 
        name,
        categories (
          id, 
          name
        )
      )
    `,
    )
    .order('stock', { ascending: true }); // Tampilkan stok rendah di atas

  if (error) {
    console.error('Error fetching stock data:', error.message);
    return [];
  }
  // @ts-ignore
  return data as VariantWithProduct[];
}

// 2. Ambil semua produk (untuk dropdown "Tambah Varian")
async function getProducts(): Promise<SimpleProduct[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return data;
}

// 3. Ambil semua kategori (untuk filter)
async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    return [];
  }
  return data as Category[];
}

export default async function AdminStockPage() {
  // Fetch semua data di server
  const [variants, allProducts, categories] = await Promise.all([
    getStockData(),
    getProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Header sekarang dirender di dalam StockClient */}
      <StockClient
        initialVariants={variants}
        allProducts={allProducts}
        allCategories={categories}
      />
      <Toaster />
    </>
  );
}