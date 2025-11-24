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

  // 1. Validasi Input Dasar
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

  // 2. Validasi Bukti Bayar (Wajib jika bukan COD)
  if (method !== 'cod') {
    if (!proofFile || proofFile.size === 0) {
      return {
        success: false,
        message: 'Bukti pembayaran wajib diunggah untuk metode Transfer/E-Wallet.',
      };
    }
    // Validasi tipe file sederhana
    if (!proofFile.type.startsWith('image/')) {
      return {
        success: false,
        message: 'File bukti pembayaran harus berupa gambar.',
      };
    }
  }

  let paymentProofUrl = null;

  try {
    // 3. Upload Gambar ke Supabase Storage (Jika bukan COD)
    if (method !== 'cod' && proofFile) {
      const fileExtension = proofFile.name.split('.').pop();
      const fileName = `${order_id}-${Date.now()}.${fileExtension}`;
      const filePath = `proofs/${fileName}`;

      // Pastikan bucket 'payment-proofs' sudah dibuat di Supabase
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs') 
        .upload(filePath, proofFile);

      if (uploadError) throw new Error(`Gagal upload bukti: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);
      
      paymentProofUrl = urlData.publicUrl;
    }

    // 4. Insert ke Tabel Payments
    const { error: insertError } = await supabase.from('payments').insert({
      order_id,
      method,
      amount,
      payment_proof_url: paymentProofUrl,
      status: 'pending', // Default status
    });

    if (insertError) throw insertError;

    // 5. Update Status Order (Opsional, tergantung flow bisnis)
    // Jika COD, mungkin langsung ubah status order jadi 'processing' atau tetap 'pending_payment'
    // Untuk tutorial ini, kita biarkan order status tetap 'pending_payment' sampai Admin memverifikasi di dashboard Admin.

  } catch (error: any) {
    return {
      success: false,
      message: `Terjadi kesalahan: ${error.message}`,
    };
  }

  // 6. Redirect ke halaman sukses/riwayat
  revalidatePath('/dashboard/customer/history');
  redirect('/dashboard/customer/history');
}