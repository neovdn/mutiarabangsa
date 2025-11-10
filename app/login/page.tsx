'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

// Helper component untuk list fitur di sisi kiri
const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    {/* Ukuran ikon disesuaikan */}
    <CheckCircle className="h-5 w-5 text-white" />
    {/* Ukuran font disesuaikan */}
    <span className="text-base">{text}</span>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Pendaftaran berhasil! Silakan login.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile) {
          if (profile.role === 'admin') {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/customer');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Mengembalikan grid layout ke 1:1 di desktop, dan 1 kolom di mobile
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Kolom Kiri (Desain) - Dibuat responsif */}
      <div className="relative flex h-64 md:h-screen flex-col items-center justify-center p-6 md:p-10 bg-login-bg bg-cover bg-center text-white">
        {/* Overlay Gradien */}
        <div className="absolute inset-0 bg-login-gradient z-0" />

        {/* Konten */}
        {/* Konten dibuat responsif (ukuran & padding) */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <Image
            src="/img/MUTIARABANGSA.png"
            alt="Mutiara Bangsa Logo"
            width={160} // Ukuran desktop
            height={46}
            priority
            className="mb-4 md:mb-6 w-[140px] md:w-[160px] h-auto" // <-- DITAMBAHKAN 'h-auto'
          />
          {/* Ukuran font dibuat responsif */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4">
            Mutiara Bangsa
          </h1>
          {/* Ukuran font dan max-width dibuat responsif */}
          <p className="text-sm md:text-base max-w-xs md:max-w-sm mb-6 md:mb-8">
            Website pembelian dan pemesanan seragam sekolah
          </p>

          {/* List fitur disembunyikan di mobile */}
          <div className="hidden md:flex flex-col space-y-3 text-left self-start max-w-sm">
            <FeatureItem text="Katalog Produk Online" />
            <FeatureItem text="Sistem Pemesanan Online" />
            <FeatureItem text="Admin Dashboard" />
            <FeatureItem text="Inventory Forecast & Restock Helper" />
          </div>
        </div>
      </div>

      {/* Kolom Kanan (Form) */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo mobile di panel ini dihapus karena panel kiri sudah terlihat */}

          <h2 className="text-3xl font-bold text-center mb-2">
            Selamat Datang
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Masuk ke akun anda untuk mengakses toko
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="bg-gray-100 border-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="bg-gray-100 border-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bagian "Ingat saya" & "Lupa password?" */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-gray-600"
                >
                  Ingat saya
                </Label>
              </div>
              <Link
                href="#"
                className="text-sm text-primary hover:underline font-medium"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-button-gradient text-black font-semibold py-6 shadow-md hover:opacity-90 rounded-sm"
              disabled={loading}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Registrasi disini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}