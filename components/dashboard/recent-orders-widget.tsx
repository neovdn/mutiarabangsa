'use client';

import { Clock, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Menggunakan helper yang sudah ada di projectmu

const recentOrders = [
  { id: 'ORD-001', status: 'Dikirim', items: 3, total: 450000, date: '2 hari lalu' },
  { id: 'ORD-002', status: 'Diproses', items: 1, total: 125000, date: '5 hari lalu' }
];

export function RecentOrdersWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-600" />
          Pesanan Terbaru
        </h2>
        <button className="text-cyan-600 font-medium hover:text-cyan-700 text-sm">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-3">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{order.id}</p>
                <p className="text-sm text-gray-500">{order.items} item • {order.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{formatCurrency(order.total)}</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}