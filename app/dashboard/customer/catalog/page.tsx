import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { ProductWithDetails, Category } from '@/types/product';
import { Toaster } from '@/components/ui/toaster';
import { CatalogClient } from './catalog-client';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<ProductWithDetails[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(*),
      product_variants(*),
      reviews(
        id,
        rating,
        comment,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

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

export default async function CustomerCatalogPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-4">
        <CatalogClient initialProducts={products} categories={categories} />
        <Toaster />
      </div>
    </div>
  );
}