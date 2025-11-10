// lib/supabaseServerClient.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Implementasi 'getAll' yang baru
        getAll() {
          return cookieStore.getAll();
        },
        // Implementasi 'setAll' yang baru
        setAll(cookiesToSet) {
          // 'cookiesToSet' adalah array, kita perlu loop dan set satu per satu
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Tangani error jika terjadi (misalnya, di Route Handler yang read-only)
              // Untuk Server Action, ini seharusnya aman.
            }
          });
        },
      },
    }
  );
}