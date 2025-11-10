import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, type NextResponse } from 'next/server';

// Ini adalah fungsi khusus yang dirancang untuk berjalan HANYA di Middleware
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value); // <-- Update request
            response.cookies.set(name, value, options); // <-- Update response
          });
        },
      },
    }
  );
}