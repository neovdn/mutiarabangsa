// lib/supabaseServerClient.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Fungsi ini akan membuat client yang memiliki sesi pengguna yang sedang login
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // --- PERBAIKAN DI BAWAH INI ---
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Tangani error jika cookies dimaksudkan untuk dibaca saja
            // (misalnya dalam Next.js App Router route handlers)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Tangani error jika cookies dimaksudkan untuk dibaca saja
          }
        },
        // --- BATAS PERBAIKAN ---
      },
    }
  );
}