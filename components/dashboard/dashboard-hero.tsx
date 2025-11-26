'use client';

import { Zap } from 'lucide-react';

export function DashboardHero() {
  return (
    // Mengubah rounded, padding, dan margin bottom
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl shadow-lg">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      {/* Padding dikurangi drastis (py-8) */}
      <div className="relative px-6 py-8 md:px-10 md:py-10 pb-16"> 
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium mb-3">
            <Zap className="w-3 h-3" />
            Semester Baru Telah Tiba!
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
            Selamat Datang di Mutiara Bangsa
          </h1>
          <p className="text-sm md:text-base text-blue-100 mb-4 leading-relaxed max-w-lg">
            Lengkapi kebutuhan seragam dan alat tulis sekolah dengan mudah dan cepat.
          </p>
        </div>
      </div>
    </div>
  );
}