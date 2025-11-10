import { Suspense } from 'react';
import LoginClient from './login-client'; // <-- Impor komponen yang baru Anda ubah namanya

// Ini adalah Server Component (default di App Router)
export default function LoginPage() {
  return (
    // Suspense adalah "boundary" yang diminta oleh Next.js
    // Ini akan menangani pemuatan komponen klien Anda
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}