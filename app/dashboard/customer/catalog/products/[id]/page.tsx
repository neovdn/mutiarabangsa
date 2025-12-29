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
    // Mengubah py-8 menjadi py-6 dan background lebih bersih
    <div className="bg-gray-50/50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}