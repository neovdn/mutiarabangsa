/*
 * File dimodifikasi: app/dashboard/admin/products/page.tsx
 * Deskripsi: Diubah menjadi Server Component untuk fetch data awal
 * dan menampilkan komponen client untuk interaktivitas.
 */
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { ProductClient } from './product-client';
import { ProductWithDetails, Category } from '@/types/product';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

// Fungsi untuk mengambil data dari Supabase
async function getProducts(): Promise<ProductWithDetails[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return data as ProductWithDetails[];
}

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

export default async function AdminProductsPage() {
  // Fetch data di server
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Kelola Produk</h2>
        <p className="text-gray-600">
          Tambah, edit, dan atur semua produk toko Anda
        </p>
      </div>

      {/* Render komponen client untuk tabel dan dialog interaktif */}
      <ProductClient initialProducts={products} categories={categories} />
      <Toaster />
    </>
  );
}