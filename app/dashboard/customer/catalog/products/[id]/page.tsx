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

// Fungsi Baru: Mengambil produk serupa berdasarkan kategori
async function getRelatedProducts(currentProductId: string, categoryId: string | null) {
  const supabase = createSupabaseServerClient();
  
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(*),
      product_variants(*),
      reviews(rating)
    `)
    .neq('id', currentProductId) // Jangan tampilkan produk yang sedang dilihat
    .limit(4); // Batasi 4 produk saja

  // Jika ada kategori, filter berdasarkan kategori tersebut
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related products:', error.message);
    return [];
  }

  return data;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductDetail(params.id);

  if (!product) {
    notFound();
  }

  // Ambil produk terkait
  const relatedProducts = await getRelatedProducts(params.id, product.category_id);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ProductDetailClient 
          product={product} 
          relatedProducts={relatedProducts} // Oper data ke client
        />
      </div>
    </div>
  );
}