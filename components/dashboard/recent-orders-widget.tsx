'use client';

import { Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/types/order';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface RecentOrdersWidgetProps {
  orders: Order[];
}

export function RecentOrdersWidget({ orders }: RecentOrdersWidgetProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500 text-sm">Belum ada riwayat pesanan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 text-sm">{formatCurrency(order.total_amount)}</p>
              <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full capitalize
                ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
        <Link 
          href="/dashboard/customer/history" 
          className="text-[#E8207E] text-xs font-semibold hover:text-[#E8207E]/80 inline-flex items-center gap-1"
        >
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}