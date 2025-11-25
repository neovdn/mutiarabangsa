'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type PaymentFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

// Update schema untuk menyertakan alamat
const paymentSchema = z.object({
  order_id: z.string().uuid(),
  method: z.enum(['bank_transfer', 'e_wallet', 'cod'], {
    errorMap: () => ({ message: 'Pilih metode pembayaran yang valid' }),
  }),
  amount: z.coerce.number(),
  // Data Alamat Validasi
  street: z.string().min(5, 'Alamat jalan wajib diisi (min 5 karakter)'),
  city: z.string().min(3, 'Kota wajib diisi'),
  province: z.string().min(3, 'Provinsi wajib diisi'),
  postal_code: z.string().min(3, 'Kode pos wajib diisi'),
});

export async function submitPayment(
  prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const supabase = createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Anda harus login.' };
  }

  // Validasi input
  const validatedFields = paymentSchema.safeParse({
    order_id: formData.get('order_id'),
    method: formData.get('method'),
    amount: formData.get('amount'),
    street: formData.get('street'),
    city: formData.get('city'),
    province: formData.get('province'),
    postal_code: formData.get('postal_code'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Mohon lengkapi semua data formulir.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { order_id, method, amount, street, city, province, postal_code } = validatedFields.data;
  const proofFile = formData.get('payment_proof') as File | null;

  // Validasi Bukti Bayar (jika bukan COD)
  if (method !== 'cod') {
    if (!proofFile || proofFile.size === 0) {
      return { success: false, message: 'Bukti pembayaran wajib diunggah.' };
    }
    if (!proofFile.type.startsWith('image/')) {
      return { success: false, message: 'File bukti harus berupa gambar.' };
    }
  }

  let paymentProofUrl = null;

  try {
    // 1. Update Alamat Pengiriman di tabel orders
    const { error: addressError } = await supabase
      .from('orders')
      .update({
        shipping_address_street: street,
        shipping_address_city: city,
        shipping_address_province: province,
        shipping_address_postal_code: postal_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('user_id', user.id); // Keamanan ekstra: pastikan milik user

    if (addressError) throw new Error(`Gagal menyimpan alamat: ${addressError.message}`);

    // 2. Upload Bukti (jika ada)
    if (method !== 'cod' && proofFile) {
      const fileExtension = proofFile.name.split('.').pop();
      const fileName = `${order_id}-${Date.now()}.${fileExtension}`;
      const filePath = `proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs') 
        .upload(filePath, proofFile);

      if (uploadError) throw new Error(`Gagal upload bukti: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);
      
      paymentProofUrl = urlData.publicUrl;
    }

    // 3. Insert ke tabel payments
    const { error: insertError } = await supabase.from('payments').insert({
      order_id,
      method,
      amount,
      payment_proof_url: paymentProofUrl,
      status: 'pending',
    });

    if (insertError) throw insertError;

    // 4. Update Status Order via RPC
    const newStatus = method === 'cod' ? 'processing' : 'waiting_confirmation';

    const { error: rpcError } = await supabase.rpc('update_order_status_payment', {
      p_order_id: order_id,
      p_user_id: user.id,
      p_status: newStatus
    });

    if (rpcError) throw rpcError;

  } catch (error: any) {
    return {
      success: false,
      message: `Terjadi kesalahan: ${error.message}`,
    };
  }

  revalidatePath('/dashboard/customer/history');
  redirect('/dashboard/customer/history');
}