'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle className="h-5 w-5 text-white" />
    <span className="text-base">{text}</span>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    no_telpon: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            full_name: formData.fullName,
            no_telpon: formData.no_telpon,
            role: 'customer',
          },
        ]);

        if (profileError) throw profileError;

        router.push('/login?registered=true');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mendaftar');
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
            className="mb-6 w-[160px]"
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
        
        {/* Kartu Form */}
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-2xl md:shadow-none md:p-0 md:bg-transparent">
          
          {/* [DIHAPUS] Header Mobile "Buat Akun Baru" dihapus */}

          {/* Title "Selamat Datang" sekarang muncul di Mobile & Desktop */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
            Daftar Akun
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm md:text-base">
            Silahkan lengkapi data diri anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nama Lengkap"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
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
              <Label htmlFor="no_telpon">No. Telpon</Label>
              <Input
                id="no_telpon"
                type="tel"
                placeholder="Ex. 08123456789"
                value={formData.no_telpon}
                onChange={(e) =>
                  setFormData({ ...formData, no_telpon: e.target.value })
                }
                className="bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  className="bg-gray-50 border-gray-200 focus:bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={8}
                  className="bg-gray-50 border-gray-200 focus:bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-button-gradient text-black font-semibold py-6 shadow-md hover:opacity-90 rounded-xl mt-4"
              disabled={loading}
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>

            <div className="text-center text-sm text-gray-500 pt-2">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Login disini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}