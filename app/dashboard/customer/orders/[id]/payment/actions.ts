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

const paymentSchema = z.object({
  order_id: z.string().uuid(),
  method: z.enum(['bank_transfer', 'e_wallet', 'cod'], {
    errorMap: () => ({ message: 'Pilih metode pembayaran yang valid' }),
  }),
  amount: z.coerce.number(),
});

export async function submitPayment(
  prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const supabase = createSupabaseServerClient();

  const validatedFields = paymentSchema.safeParse({
    order_id: formData.get('order_id'),
    method: formData.get('method'),
    amount: formData.get('amount'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { order_id, method, amount } = validatedFields.data;
  const proofFile = formData.get('payment_proof') as File | null;

  // Validasi Bukti Bayar
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
    // Upload Gambar
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

    // Insert Payments
    const { error: insertError } = await supabase.from('payments').insert({
      order_id,
      method,
      amount,
      payment_proof_url: paymentProofUrl,
      status: 'pending',
    });

    if (insertError) throw insertError;

    // --- UPDATE STATUS LOGIC BARU ---
    // COD -> Langsung 'processing'
    // Transfer/E-Wallet -> 'waiting_confirmation'
    const newStatus = method === 'cod' ? 'processing' : 'waiting_confirmation';

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order_id);

    if (updateError) throw updateError;

  } catch (error: any) {
    return {
      success: false,
      message: `Terjadi kesalahan: ${error.message}`,
    };
  }

  revalidatePath('/dashboard/customer/history');
  redirect('/dashboard/customer/history');
}