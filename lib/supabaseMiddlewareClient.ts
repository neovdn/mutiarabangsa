// lib/supabaseMiddlewareClient.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // <-- KEMBALIKAN KE NEXT_PUBLIC_
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // <-- KEMBALIKAN KE NEXT_PUBLIC_
    {
      cookies: {
        // ... (sisanya sudah benar)
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value); 
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}