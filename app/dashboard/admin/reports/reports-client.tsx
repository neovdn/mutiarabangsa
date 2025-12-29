'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingBag,
  Calendar as CalendarIcon,
  Download,
  FileText,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn, formatCurrency } from '@/lib/utils';
import { SalesChart } from './sales-chart';
import { TopProductsTable } from './top-products-table';
import { StockTable } from './stock-table';
import { CategoryChart } from './category-chart';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ReportsClientProps {
  initialSalesData: any;
  initialTopProducts: any[];
  initialStockData: any;
  initialTopCategories: any[];
  initialStartDate: string;
  initialEndDate: string;
}

export function ReportsClient({
  initialSalesData,
  initialTopProducts,
  initialStockData,
  initialTopCategories,
  initialStartDate,
  initialEndDate,
}: ReportsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>(new Date(initialStartDate));
  const [endDate, setEndDate] = useState<Date>(new Date(initialEndDate));
  const [datePreset, setDatePreset] = useState('thisMonth');

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();

    switch (preset) {
      case 'thisWeek':
        setStartDate(startOfWeek(now, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(now, { weekStartsOn: 1 }));
        break;
      case 'thisMonth':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case 'last3Months':
        setStartDate(startOfMonth(subMonths(now, 2)));
        setEndDate(endOfMonth(now));
        break;
      case 'thisYear':
        setStartDate(startOfYear(now));
        setEndDate(endOfYear(now));
        break;
    }
  };

  const handleApplyFilter = () => {
    router.push(
      `/dashboard/admin/reports?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
    router.refresh();
  };

  const handleExportPDF = () => {
    toast({
      title: 'Export PDF',
      description: 'Fitur export PDF akan segera tersedia.',
    });
  };

  const handleExportExcel = () => {
    toast({
      title: 'Export Excel',
      description: 'Fitur export Excel akan segera tersedia.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Laporan & Analisis</h1>
        <p className="text-sm text-gray-500">
          Pantau performa toko dan analisis data penjualan Anda
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-gray-100 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Preset Periode */}
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-gray-700">Periode</label>
              <Select value={datePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">Minggu Ini</SelectItem>
                  <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                  <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
                  <SelectItem value="last3Months">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="thisYear">Tahun Ini</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {datePreset === 'custom' && (
              <>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Dari</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-10 bg-gray-50',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sampai</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-10 bg-gray-50',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleApplyFilter} className="bg-cyan-600 hover:bg-cyan-700">
                  Terapkan Filter
                </Button>
              </>
            )}

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="border-gray-200 hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#E8207E] shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(initialSalesData.totalRevenue)}
                </h3>
              </div>
              <div className="p-2 bg-pink-50 rounded-lg text-[#E8207E]">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              Periode: {format(startDate, 'dd MMM', { locale: id })} - {format(endDate, 'dd MMM', { locale: id })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pesanan</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {initialSalesData.totalOrders}
                </h3>
              </div>
              <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              Transaksi berhasil
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Rata-rata Transaksi</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(initialSalesData.avgOrderValue)}
                </h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-400">
              Per pesanan
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Nilai Stok</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(initialStockData.totalValue)}
                </h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center text-xs text-amber-600 font-medium">
              {initialStockData.lowStockCount} item stok menipis
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs untuk berbagai laporan */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1 h-auto">
          <TabsTrigger value="sales" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Laporan Penjualan
          </TabsTrigger>
          <TabsTrigger value="stock" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
            <Package className="h-4 w-4 mr-2" />
            Laporan Stok
          </TabsTrigger>
        </TabsList>

        {/* Laporan Penjualan */}
        <TabsContent value="sales" className="space-y-4">
          {/* Grafik Penjualan */}
          <Card className="border-gray-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Grafik Penjualan Harian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={initialSalesData.dailySales} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Products */}
            <Card className="border-gray-100 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Produk Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopProductsTable products={initialTopProducts} />
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card className="border-gray-100 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800">
                  Kategori Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart categories={initialTopCategories} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Laporan Stok */}
        <TabsContent value="stock" className="space-y-4">
          {/* Stock Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-amber-500 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Stok Menipis</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {initialStockData.lowStockCount} Varian
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Stok di bawah 10 unit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Stok Habis</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {initialStockData.outOfStockCount} Varian
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Perlu restock segera</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Table */}
          <Card className="border-gray-100 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">
                Detail Stok Barang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockTable variants={initialStockData.variants} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}