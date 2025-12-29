import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './product-detail-client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

async function getProductDetail(productId: string) {
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
        created_at,
        profiles(full_name)
      )
    `)
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Error fetching product:', error.message);
    return null;
  }

  return data;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductDetail(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}