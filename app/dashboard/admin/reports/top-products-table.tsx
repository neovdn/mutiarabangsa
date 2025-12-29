'use client';

import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Package } from 'lucide-react';

interface TopProductsTableProps {
  products: any[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Tidak ada data produk terlaris</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/30 hover:border-cyan-200 transition-all group"
        >
          {/* Rank Badge - Lebih Compact */}
          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md' :
            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' :
            'bg-blue-50 text-blue-600 border border-blue-100'
          }`}>
            {index + 1}
          </div>

          {/* Product Image - Compact */}
          <div className="relative w-12 h-12 rounded-lg border border-gray-200 bg-white overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
            <Image
              src={product.image_url || '/img/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-cyan-700 transition-colors">
              {product.name}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium text-gray-700">{product.totalQuantity}</span> terjual
              </span>
              <span className="text-cyan-600 font-bold">
                {formatCurrency(product.totalRevenue)}
              </span>
            </div>
          </div>

          {/* Percentage Bar - Visual indicator */}
          {index === 0 && (
            <div className="flex-shrink-0">
              <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}