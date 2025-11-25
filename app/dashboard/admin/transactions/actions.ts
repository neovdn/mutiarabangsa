'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema validasi input resi
const shippingSchema = z.object({
  order_id: z.string().uuid(),
  receipt_number: z.string().min(1, 'Nomor resi wajib diisi'),
});

// --- ACTION 1: Verifikasi Pembayaran ---
export async function verifyPayment(orderId: string, isValid: boolean) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Update status di tabel payments
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: isValid ? 'verified' : 'rejected', // Sesuaikan enum payment_status Anda
        verified_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (paymentError) throw new Error(`Gagal update payment: ${paymentError.message}`);

    // 2. Update status di tabel orders
    // Jika valid -> 'processing' (siap dikirim)
    // Jika tolak -> 'pending_payment' (minta user upload ulang) atau 'cancelled'
    const newOrderStatus = isValid ? 'processing' : 'pending_payment';

    const { error: orderError } = await supabase
      .from('orders')
      .update({ status: newOrderStatus })
      .eq('id', orderId);

    if (orderError) throw new Error(`Gagal update order: ${orderError.message}`);

    revalidatePath('/dashboard/admin/transactions');
    return { success: true, message: isValid ? 'Pembayaran diterima. Status: Diproses.' : 'Pembayaran ditolak.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// --- ACTION 2: Update Pengiriman (Input Resi) ---
export async function updateShipping(prevState: any, formData: FormData) {
  const supabase = createSupabaseServerClient();

  const validatedFields = shippingSchema.safeParse({
    order_id: formData.get('order_id'),
    receipt_number: formData.get('receipt_number'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Input tidak valid.',
    };
  }

  const { order_id, receipt_number } = validatedFields.data;

  try {
    // Update nomor resi DAN ubah status jadi 'shipped'
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        shipping_receipt_number: receipt_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (error) throw error;

    revalidatePath('/dashboard/admin/transactions');
    return { success: true, message: 'Resi disimpan. Status: Dikirim.' };
  } catch (error: any) {
    return { success: false, message: `Gagal update pengiriman: ${error.message}` };
  }
}