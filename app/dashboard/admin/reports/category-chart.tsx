'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  categories: any[];
}

const COLORS = ['#0891b2', '#E8207E', '#3b82f6', '#f59e0b', '#10b981'];

export function CategoryChart({ categories }: CategoryChartProps) {
  if (categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm">Tidak ada data kategori</p>
        </div>
      </div>
    );
  }

  // Format data untuk pie chart
  const chartData = categories.map((cat, index) => ({
    name: cat.name,
    value: cat.totalRevenue,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%" // Naikkan sedikit agar muat Legend di bawah
          labelLine={false}
          // Hapus label props yang bikin teks hilang/tabrakan
          // Kita ganti dengan Legend di bawah
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '8px 12px',
          }}
          formatter={(value: any) => [formatCurrency(value), 'Pendapatan']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          formatter={(value, entry: any) => (
            <span className="text-xs text-gray-600 font-medium ml-1">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}