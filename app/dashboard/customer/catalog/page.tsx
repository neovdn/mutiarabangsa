/*
 * File: app/dashboard/customer/catalog/page.tsx
 * Deskripsi: Server Component untuk mengambil data produk & kategori
 * dan meneruskannya ke client component.
 */

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { ProductWithDetails, Category } from '@/types/product';
import { Toaster } from '@/components/ui/toaster';
import { CatalogClient } from './catalog-client';

export const dynamic = 'force-dynamic';

// Fungsi untuk mengambil data produk lengkap
async function getProducts(): Promise<ProductWithDetails[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)') // Ambil relasi
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return data as ProductWithDetails[];
}

// Fungsi untuk mengambil kategori (untuk filter)
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

export default async function CustomerCatalogPage() {
  // Fetch data di server
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Katalog Produk</h2>
        <p className="text-gray-600">
          Temukan perlengkapan sekolah yang Anda butuhkan
        </p>
      </div>

      {/* Render komponen client untuk interaktivitas */}
      <CatalogClient initialProducts={products} categories={categories} />
      <Toaster />
    </>
  );
}