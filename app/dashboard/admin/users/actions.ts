'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Profile, UserRole } from '@/types/user';

// Setup Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Schema Validasi
const userFormSchema = z.object({
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  role: z.enum(['admin', 'customer']),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  no_telpon: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_province: z.string().optional(),
});

export type UserFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function upsertUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  // Cek sesi admin
  const supabase = createSupabaseServerClient();
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    return { success: false, message: 'Unauthorized' };
  }

  // Validasi Input
  const rawData = {
    email: formData.get('email') as string,
    full_name: formData.get('full_name') as string,
    role: formData.get('role') as UserRole,
    password: formData.get('password') as string,
    no_telpon: formData.get('no_telpon') as string,
    address_street: formData.get('address_street') as string,
    address_city: formData.get('address_city') as string,
    address_province: formData.get('address_province') as string,
  };

  const validated = userFormSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: 'Validasi gagal',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const userId = formData.get('id') as string | null;
  const isEditing = !!userId;

  try {
    let targetUserId = userId;

    if (!isEditing) {
      // --- CREATE NEW USER ---
      if (!rawData.password) {
        return { success: false, message: 'Password wajib diisi untuk user baru', errors: { password: ['Wajib diisi'] } };
      }

      const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: rawData.email,
        password: rawData.password,
        email_confirm: true,
        user_metadata: { full_name: rawData.full_name, role: rawData.role }
      });

      if (createError) throw new Error(createError.message);
      targetUserId = authData.user.id;
    } else {
      // --- UPDATE EXISTING USER (Auth Data) ---
      // Update email/password jika diisi (Opsional)
      const authUpdates: any = { email: rawData.email };
      if (rawData.password && rawData.password.trim() !== '') {
        authUpdates.password = rawData.password;
      }

      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId!, 
        authUpdates
      );
      if (updateAuthError) throw new Error(`Gagal update auth: ${updateAuthError.message}`);
    }

    // --- UPSERT PROFILE DATA ---
    // Karena Auth -> Profile biasanya via trigger, kita lakukan upsert manual untuk memastikan data lengkap
    const profileData = {
      id: targetUserId,
      full_name: rawData.full_name,
      role: rawData.role,
      no_telpon: rawData.no_telpon || null,
      address_street: rawData.address_street || null,
      address_city: rawData.address_city || null,
      address_province: rawData.address_province || null,
      // address_postal_code belum ada di form, sesuaikan jika perlu
    };

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData);

    if (profileError) throw new Error(`Gagal update profil: ${profileError.message}`);

    revalidatePath('/dashboard/admin/users');
    return { success: true, message: `User berhasil ${isEditing ? 'diperbarui' : 'dibuat'}.` };

  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function toggleUserStatus(userId: string, shouldBan: boolean): Promise<UserFormState> {
  try {
    const banDuration = shouldBan ? '876000h' : '0s'; // 100 tahun vs 0 detik
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: banDuration
    });

    if (error) throw error;
    revalidatePath('/dashboard/admin/users');
    return { success: true, message: `User berhasil ${shouldBan ? 'dinonaktifkan' : 'diaktifkan'}.` };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function deleteUser(userId: string): Promise<UserFormState> {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    
    revalidatePath('/dashboard/admin/users');
    return { success: true, message: 'User berhasil dihapus permanent.' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}