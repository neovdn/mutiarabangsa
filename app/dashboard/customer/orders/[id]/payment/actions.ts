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

// Schema validasi
const paymentSchema = z.object({
  order_id: z.string().uuid(),
  method: z.enum(['bank_transfer', 'e_wallet', 'cod'], {
    errorMap: () => ({ message: 'Pilih metode pembayaran yang valid' }),
  }),
  amount: z.coerce.number(),
  // Schema Alamat (Wajib)
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
  
  // 1. Cek User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Sesi habis. Silakan login kembali.' };
  }

  // 2. Validasi Data Form
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
      message: 'Mohon lengkapi semua data alamat dengan benar.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { order_id, method, amount, street, city, province, postal_code } = validatedFields.data;
  const proofFile = formData.get('payment_proof') as File | null;

  // 3. Validasi Bukti Bayar (Kecuali COD)
  if (method !== 'cod') {
    if (!proofFile || proofFile.size === 0) {
      return { success: false, message: 'Bukti pembayaran wajib diunggah.' };
    }
    if (!proofFile.type.startsWith('image/')) {
      return { success: false, message: 'File bukti harus berupa gambar (JPG/PNG).' };
    }
  }

  let paymentProofUrl = null;

  try {
    // 4. UPDATE ALAMAT (PENTING: Menggunakan select() untuk verifikasi)
    const { data: updatedOrder, error: addressError } = await supabase
      .from('orders')
      .update({
        shipping_address_street: street,
        shipping_address_city: city,
        shipping_address_province: province,
        shipping_address_postal_code: postal_code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('user_id', user.id) // Pastikan hanya mengupdate order milik user sendiri
      .select(); // <-- Return data yang diupdate untuk pengecekan

    if (addressError) throw new Error(`Gagal menyimpan alamat: ${addressError.message}`);
    
    // Jika tidak ada data yang dikembalikan, berarti order_id tidak ditemukan atau user_id tidak cocok
    if (!updatedOrder || updatedOrder.length === 0) {
      throw new Error('Order tidak ditemukan atau Anda tidak memiliki akses.');
    }

    // 5. Upload Bukti ke Storage (Jika ada)
    if (method !== 'cod' && proofFile) {
      const fileExtension = proofFile.name.split('.').pop();
      const fileName = `proof-${order_id}-${Date.now()}.${fileExtension}`;
      const filePath = `payment-proofs/${fileName}`; // Pastikan bucket 'payment-proofs' ada dan public/policy open

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs') 
        .upload(filePath, proofFile, { upsert: true });

      if (uploadError) throw new Error(`Gagal upload gambar: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);
      
      paymentProofUrl = urlData.publicUrl;
    }

    // 6. Insert Record Pembayaran
    const { error: insertError } = await supabase.from('payments').insert({
      order_id,
      method,
      amount,
      payment_proof_url: paymentProofUrl,
      status: 'pending',
    });

    if (insertError) throw new Error(`Gagal menyimpan pembayaran: ${insertError.message}`);

    // 7. Update Status Order via RPC (Agar aman & atomik)
    // Status: 'waiting_confirmation' (Transfer) atau 'processing' (COD)
    const newStatus = method === 'cod' ? 'processing' : 'waiting_confirmation';

    const { error: rpcError } = await supabase.rpc('update_order_status_payment', {
      p_order_id: order_id,
      p_user_id: user.id,
      p_status: newStatus
    });

    if (rpcError) throw new Error(`Gagal update status order: ${rpcError.message}`);

  } catch (error: any) {
    console.error('Payment Submit Error:', error);
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat memproses pembayaran.',
    };
  }

  // 8. Redirect Sukses
  revalidatePath('/dashboard/customer/history');
  redirect('/dashboard/customer/history');
}