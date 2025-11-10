// lib/supabaseServerClient.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // <-- KEMBALIKAN KE NEXT_PUBLIC_
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // <-- KEMBALIKAN KE NEXT_PUBLIC_
    {
      cookies: {
        // ... (sisanya sudah benar)
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // ...
            }
          });
        },
      },
    }
  );
}