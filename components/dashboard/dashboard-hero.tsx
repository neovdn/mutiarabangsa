'use client';

import { Zap } from 'lucide-react';

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl mb-8 shadow-2xl">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative px-8 py-12 md:px-12 md:py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Promo Spesial Semester Baru!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Selamat Datang di<br />Mutiara Bangsa
          </h1>
          <p className="text-lg text-blue-100 mb-6 leading-relaxed">
            Temukan semua kebutuhan sekolah Anda dengan kualitas terbaik dan harga terjangkau
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Belanja Sekarang
            </button>
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20">
              Lihat Promo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}