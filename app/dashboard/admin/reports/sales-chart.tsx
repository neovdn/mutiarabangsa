'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  data: any[];
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by date
    const grouped = data.reduce((acc: any, order: any) => {
      const date = format(parseISO(order.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }
      acc[date].revenue += order.total_amount;
      acc[date].orders += 1;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .map((item: any) => ({
        ...item,
        dateLabel: format(parseISO(item.date), 'dd MMM', { locale: id }),
      }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Tidak ada data penjualan</p>
          <p className="text-sm">pada periode yang dipilih</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="dateLabel" 
          tick={{ fontSize: 12 }}
          stroke="#888"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#888"
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
            return value;
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: any, name: string) => {
            if (name === 'revenue') return [formatCurrency(value), 'Pendapatan'];
            if (name === 'orders') return [value, 'Pesanan'];
            return [value, name];
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => {
            if (value === 'revenue') return 'Pendapatan';
            if (value === 'orders') return 'Jumlah Pesanan';
            return value;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#0891b2" 
          strokeWidth={3}
          dot={{ fill: '#0891b2', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke="#E8207E" 
          strokeWidth={2}
          dot={{ fill: '#E8207E', r: 3 }}
          activeDot={{ r: 5 }}
          yAxisId={0}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}