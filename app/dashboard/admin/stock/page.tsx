import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { StockClient, VariantWithProduct } from './stock-client';
import { Toaster } from '@/components/ui/toaster';
import { Category } from '@/types/product';

export const dynamic = 'force-dynamic';

type SimpleProduct = {
  id: string;
  name: string;
};

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
    .order('stock', { ascending: true });

  if (error) {
    console.error('Error fetching stock data:', error.message);
    return [];
  }
  // @ts-ignore
  return data as VariantWithProduct[];
}

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
  const [variants, allProducts, categories] = await Promise.all([
    getStockData(),
    getProducts(),
    getCategories(),
  ]);

  return (
    // -m-8 untuk override padding layout default
    <div className="-m-8 w-[calc(100%+4rem)] min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-8 pb-8 pt-2">
      <div className="container mx-auto max-w-[1600px]">
        <StockClient
          initialVariants={variants}
          allProducts={allProducts}
          allCategories={categories}
        />
        <Toaster />
      </div>
    </div>
  );
}