'use client';

import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface TopProductsTableProps {
  products: any[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">Tidak ada data produk terlaris</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          {/* Rank Badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            index === 0 ? 'bg-yellow-100 text-yellow-700' :
            index === 1 ? 'bg-gray-100 text-gray-700' :
            index === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-blue-50 text-blue-600'
          }`}>
            {index + 1}
          </div>

          {/* Product Image */}
          <div className="relative w-12 h-12 rounded-md border border-gray-200 bg-white overflow-hidden flex-shrink-0">
            <Image
              src={product.image_url || '/img/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {product.name}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {product.totalQuantity} terjual
              </span>
              <span className="text-cyan-600 font-semibold">
                {formatCurrency(product.totalRevenue)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}