'use client';

import { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      <div className="h-72 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-base font-medium">Tidak ada data penjualan</p>
          <p className="text-sm">pada periode yang dipilih</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* PERBAIKAN: Gunakan AreaChart untuk visualisasi yang lebih modern */}
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="dateLabel" 
          tick={{ fontSize: 11 }}
          stroke="#888"
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 11 }}
          stroke="#888"
          tickLine={false}
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
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '12px',
          }}
          formatter={(value: any, name: string) => {
            if (name === 'revenue') return [formatCurrency(value), 'Pendapatan'];
            if (name === 'orders') return [value + ' pesanan', 'Jumlah Order'];
            return [value, name];
          }}
          labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
        />
        
        {/* PERBAIKAN: Hanya tampilkan revenue dengan area chart yang lebih eye-catching */}
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#0891b2" 
          strokeWidth={3}
          fill="url(#colorRevenue)"
          dot={{ fill: '#0891b2', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}