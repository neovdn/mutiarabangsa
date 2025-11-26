import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { ProductClient } from './product-client';
import { ProductWithDetails, Category } from '@/types/product';
import { Toaster } from '@/components/ui/toaster';

export const dynamic = 'force-dynamic';

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
  const products = await getProducts();
  const categories = await getCategories();

  return (
    // Update: padding atas diubah jadi pt-2 agar tidak ada jarak kosong besar
    <div className="-m-8 w-[calc(100%+4rem)] min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-8 pb-8 pt-2">
      <div className="container mx-auto max-w-[1600px]">
        <ProductClient initialProducts={products} categories={categories} />
        <Toaster />
      </div>
    </div>
  );
}