import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabaseMiddlewareClient'; // <-- Impor client baru

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Buat client Supabase untuk middleware
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Perbarui sesi. Ini akan me-refresh token jika kedaluwarsa.
  // Ini adalah langkah terpenting!
  await supabase.auth.getSession();

  return response;
}

// Tentukan path mana yang harus dijalankan oleh middleware
export const config = {
  matcher: [
    /*
     * Cocokkan semua path request KECUALI untuk:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (file favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};