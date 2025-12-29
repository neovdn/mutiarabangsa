'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type ReviewFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

const reviewSchema = z.object({
  order_id: z.string().uuid('Order ID tidak valid'),
  product_id: z.string().uuid('Product ID tidak valid'),
  rating: z.coerce.number().int().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  comment: z.string().optional(),
});

export async function submitReview(
  prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const supabase = createSupabaseServerClient();

  // 1. Cek autentikasi
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Anda harus login terlebih dahulu.' };
  }

  // 2. Validasi input
  const validatedFields = reviewSchema.safeParse({
    order_id: formData.get('order_id'),
    product_id: formData.get('product_id'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Data tidak valid',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { order_id, product_id, rating, comment } = validatedFields.data;

  try {
    // 3. Verifikasi order milik user dan statusnya completed
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return { success: false, message: 'Order tidak ditemukan.' };
    }

    if (order.status !== 'completed') {
      return { success: false, message: 'Hanya order yang selesai yang bisa direview.' };
    }

    // 4. Cek apakah user sudah pernah review produk ini di order ini
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('order_id', order_id)
      .maybeSingle();

    if (existingReview) {
      return { success: false, message: 'Anda sudah memberikan review untuk produk ini.' };
    }

    // 5. Insert review
    const { error: insertError } = await supabase.from('reviews').insert({
      user_id: user.id,
      product_id: product_id,
      order_id: order_id,
      rating: rating,
      comment: comment || null,
    });

    if (insertError) {
      throw new Error(`Gagal menyimpan review: ${insertError.message}`);
    }

    // 6. Revalidate pages
    revalidatePath('/dashboard/customer/history');
    revalidatePath('/dashboard/customer/catalog');
    revalidatePath(`/dashboard/customer/catalog/products/${product_id}`);

    return {
      success: true,
      message: 'Terima kasih! Review Anda telah berhasil dikirim.',
    };
  } catch (error: any) {
    console.error('Submit Review Error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat mengirim review.',
    };
  }
}