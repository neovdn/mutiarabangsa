'use client';

import { useState } from 'react';
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
  FileSpreadsheet
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
  const [datePreset, setDatePreset] = useState('thisYear');

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    let newStart = startDate;
    let newEnd = endDate;

    switch (preset) {
      case 'thisWeek':
        newStart = startOfWeek(now, { weekStartsOn: 1 });
        newEnd = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        newStart = startOfMonth(now);
        newEnd = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        newStart = startOfMonth(lastMonth);
        newEnd = endOfMonth(lastMonth);
        break;
      case 'last3Months':
        newStart = startOfMonth(subMonths(now, 2));
        newEnd = endOfMonth(now);
        break;
      case 'thisYear':
        newStart = startOfYear(now);
        newEnd = endOfYear(now);
        break;
    }
    
    setStartDate(newStart);
    setEndDate(newEnd);

    if (preset !== 'custom') {
      router.push(
        `/dashboard/admin/reports?start=${newStart.toISOString()}&end=${newEnd.toISOString()}`
      );
      router.refresh();
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
      description: 'Laporan sedang disiapkan untuk diunduh (PDF)...',
    });
  };

  const handleExportExcel = () => {
    toast({
      title: 'Export Excel',
      description: 'Laporan sedang disiapkan untuk diunduh (Excel)...',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* SIDEBAR KIRI - 30% */}
      <aside className="w-full lg:w-[30%] flex-shrink-0 space-y-4">
        
        {/* Filter Periode */}
        <Card className="border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-cyan-600" />
              Filter Periode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Preset Periode */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Pilih Periode</label>
              <Select value={datePreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="h-9 bg-gray-50 border-gray-200 text-sm w-full">
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Dari</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-9 bg-gray-50 text-sm',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {startDate ? format(startDate, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Sampai</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-9 bg-gray-50 text-sm',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {endDate ? format(endDate, 'dd MMM yyyy', { locale: id }) : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button 
                  onClick={handleApplyFilter} 
                  className="bg-cyan-600 hover:bg-cyan-700 h-9 text-sm w-full"
                >
                  Terapkan Filter
                </Button>
              </>
            )}

            <div className="text-[10px] text-gray-500 pt-2 border-t text-center">
              {format(startDate, 'dd MMM yyyy', { locale: id })} - {format(endDate, 'dd MMM yyyy', { locale: id })}
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards - Stacked Vertical */}
        <div className="space-y-3">
          {/* Card Pendapatan */}
          <Card className="border-l-4 border-l-[#E8207E] shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Total Pendapatan</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(initialSalesData.totalRevenue)}
                  </h3>
                </div>
                <div className="p-1.5 bg-pink-50 rounded-lg text-[#E8207E]">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Orders */}
          <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Total Pesanan</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                    {initialSalesData.totalOrders}
                  </h3>
                </div>
                <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] text-gray-400">
                Transaksi berhasil
              </div>
            </CardContent>
          </Card>

          {/* Card Avg Order */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Rata-rata Order</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(initialSalesData.avgOrderValue)}
                  </h3>
                </div>
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] text-gray-400">
                Per pesanan
              </div>
            </CardContent>
          </Card>

          {/* Card Stok Value */}
          <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500">Nilai Stok</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(initialStockData.totalValue)}
                  </h3>
                </div>
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] text-amber-600 font-medium">
                {initialStockData.lowStockCount} stok menipis
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* KONTEN KANAN - 70% */}
      <div className="flex-1 w-full lg:w-[70%]">
        <Tabs defaultValue="sales" className="space-y-4">
          
          {/* HEADER BAR: Tabs Selector (Kiri) & Export Buttons (Kanan) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-gray-100 shadow-sm">
            <TabsList className="bg-gray-100/50 p-1 h-auto w-full sm:w-auto">
              <TabsTrigger value="sales" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Penjualan
              </TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
                <Package className="h-3.5 w-3.5 mr-1.5" />
                Stok
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 w-full sm:w-auto">
               <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="flex-1 sm:flex-none border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-9 text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="flex-1 sm:flex-none border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 h-9 text-xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          {/* Laporan Penjualan */}
          <TabsContent value="sales" className="space-y-4 mt-0">
            
            {/* Grafik Penjualan (Full Width) */}
            <Card className="border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-gray-50 mb-2">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center justify-between">
                  <span>Tren Penjualan Harian</span>
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {format(startDate, 'd MMM')} - {format(endDate, 'd MMM yyyy')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart data={initialSalesData.dailySales} />
              </CardContent>
            </Card>

            {/* Grid 60% Produk Terlaris, 40% Kategori Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* Produk Terlaris - 60% (3 kolom) */}
              <div className="lg:col-span-3">
                <Card className="border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-gray-800">
                      Top 5 Produk Terlaris
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TopProductsTable products={initialTopProducts} />
                  </CardContent>
                </Card>
              </div>

              {/* Kategori Chart - 40% (2 kolom) */}
              <div className="lg:col-span-2">
                <Card className="border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold text-gray-800">
                      Kategori Terlaris
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryChart categories={initialTopCategories} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Laporan Stok (TIDAK BERUBAH BANYAK, HANYA WRAPPER) */}
          <TabsContent value="stock" className="space-y-4 mt-0">
            {/* ... Isi Tabs Stock tetap sama dengan kode kamu sebelumnya ... */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-l-4 border-l-amber-500 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-amber-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Stok Menipis</p>
                      <p className="text-xl font-bold text-amber-600 mt-0.5">
                        {initialStockData.lowStockCount}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">10 unit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 bg-white/90 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-red-50 rounded-lg">
                      <Package className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Stok Habis</p>
                      <p className="text-xl font-bold text-red-600 mt-0.5">
                        {initialStockData.outOfStockCount}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Perlu restock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-100 shadow-sm bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-gray-800">
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
    </div>
  );
}