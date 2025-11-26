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

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle className="h-5 w-5 text-white" />
    <span className="text-base">{text}</span>
  </div>
);

export default function LoginClient() {
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
    <div className="min-h-screen relative flex flex-col justify-center md:grid md:grid-cols-2">
      
      {/* --- PANEL VISUAL (BACKGROUND) --- */}
      <div className="absolute inset-0 z-0 md:relative md:flex md:h-screen flex-col items-center justify-center p-6 md:p-10 bg-login-bg bg-cover bg-center text-white">
        <div className="absolute inset-0 bg-login-gradient z-0 opacity-90 md:opacity-100" />

        {/* Konten Visual (Hanya Desktop) */}
        <div className="relative z-10 hidden md:flex flex-col items-center text-center">
          <Image
            src="/img/MUTIARABANGSA.png"
            alt="Mutiara Bangsa Logo"
            width={160} 
            height={46}
            priority
            className="mb-6 w-[160px] h-auto"
          />
          <h1 className="text-4xl font-bold mb-4">
            Mutiara Bangsa
          </h1>
          <p className="text-base max-w-sm mb-8">
            Website pembelian dan pemesanan seragam sekolah
          </p>

          <div className="flex flex-col space-y-3 text-left self-start max-w-sm">
            <FeatureItem text="Katalog Produk Online" />
            <FeatureItem text="Sistem Pemesanan Online" />
            <FeatureItem text="Admin Dashboard" />
            <FeatureItem text="Inventory Forecast & Restock Helper" />
          </div>
        </div>
      </div>

      {/* --- PANEL FORMULIR --- */}
      <div className="relative z-10 flex items-center justify-center p-4 w-full md:bg-white md:p-8">
        
        {/* Container Form */}
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl md:shadow-none md:p-0 md:bg-transparent">
          
          {/* [DIHAPUS] Header Mobile "Mutiara Bangsa" dihapus agar lebih bersih */}

          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
            Selamat Datang
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm md:text-base">
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
                className="bg-gray-50 border-gray-200 focus:bg-white"
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
                  className="bg-gray-50 border-gray-200 focus:bg-white pr-10"
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
              className="w-full bg-button-gradient text-black font-semibold py-6 shadow-md hover:opacity-90 rounded-xl"
              disabled={loading}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>

            <div className="text-center text-sm text-gray-500 pt-2">
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