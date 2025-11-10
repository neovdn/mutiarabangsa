// lib/supabaseClient.ts
// HAPUS SEMUA ISI LAMA DAN GANTI DENGAN INI:

import { createBrowserClient } from '@supabase/ssr';

// Fungsi ini membuat instance client untuk sisi browser.
// Ini akan secara otomatis mengelola sesi menggunakan cookies.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}