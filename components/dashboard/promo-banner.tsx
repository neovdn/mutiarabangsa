'use client';

export function PromoBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative max-w-2xl">
        <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-4">
          🎉 DISKON HINGGA 50%
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Promo Back to School
        </h2>
        <p className="text-lg text-white/90 mb-6">
          Dapatkan diskon spesial untuk semua produk seragam dan perlengkapan sekolah. Promo terbatas!
        </p>
        <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
          Belanja Sekarang
        </button>
      </div>
    </div>
  );
}