/* File: app/dashboard/customer/history/history-client.tsx
   Update: Menambahkan fungsionalitas Filter Tanggal & Reset Filter
*/
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Calendar as CalendarIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { OrderWithDetails } from '@/types/order';
import { formatCurrency, cn } from '@/lib/utils';
import { buyAgain } from './actions';
import { TransactionDetailDialog } from './transaction-detail-dialog';

// --- Imports Baru untuk Date Picker ---
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface HistoryClientProps {
  initialOrders: OrderWithDetails[];
}

export function HistoryClient({ initialOrders }: HistoryClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [date, setDate] = useState<Date | undefined>(undefined); // <-- State Tanggal
  
  const [isLoadingBuyAgain, setIsLoadingBuyAgain] = useState<string | null>(null);

  // State Modal Detail
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Helper Mapping Status DB ke Label UI
  const statusMap: Record<string, string> = {
    pending_payment: 'Menunggu Pembayaran',
    processing: 'Diproses',
    shipped: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  // Helper Warna Badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'destructive'; 
      case 'processing': return 'default';
      case 'shipped': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  // Logic Filter Data
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // 1. Filter Search (Nama Produk atau Order ID)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        order.order_items.some(item => 
          item.product_variants?.products?.name.toLowerCase().includes(searchLower)
        );

      // 2. Filter Status Tab
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = order.status === statusFilter;
      }

      // 3. Filter Date (NEW)
      let matchesDate = true;
      if (date) {
          const orderDate = new Date(order.created_at);
          // Bandingkan tanggal, bulan, dan tahun (abaikan jam)
          matchesDate = 
            orderDate.getDate() === date.getDate() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [initialOrders, searchTerm, statusFilter, date]);

  // Handler Beli Lagi
  const handleBuyAgain = async (orderId: string) => {
    setIsLoadingBuyAgain(orderId);
    const result = await buyAgain(orderId);
    
    if (result.success) {
      toast({
        title: "Berhasil!",
        description: "Produk telah ditambahkan ke keranjang.",
      });
      router.push('/dashboard/customer/cart');
    } else {
      toast({
        title: "Gagal",
        description: result.message,
        variant: "destructive"
      });
    }
    setIsLoadingBuyAgain(null);
  };

  // Handler Detail
  const handleShowDetail = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  // Handler Pembayaran (Jika status pending_payment)
  const handlePayNow = (orderId: string) => {
    router.push(`/dashboard/customer/orders/${orderId}/payment`);
  };

  // Handler Reset Filter
  const handleResetFilter = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* --- FILTER & SEARCH SECTION --- */}
      <Card className="p-4 space-y-4 bg-white">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari transaksimu di sini..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Picker Filter (UPDATED) */}
          <div className="w-full md:w-auto flex gap-2">
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full md:w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: id }) : <span>Pilih Tanggal Transaksi</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Tombol Reset Filter (Muncul jika ada filter aktif) */}
              {(searchTerm || statusFilter !== 'all' || date) && (
                  <Button 
                    variant="ghost" 
                    onClick={handleResetFilter}
                    className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                  >
                      Reset Filter
                  </Button>
              )}
          </div>
        </div>

        {/* TABS STATUS */}
        <div className="overflow-x-auto pb-2">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="pending_payment">Menunggu Pembayaran</TabsTrigger>
                <TabsTrigger value="processing">Diproses</TabsTrigger>
                <TabsTrigger value="shipped">Dikirim</TabsTrigger>
                <TabsTrigger value="completed">Selesai</TabsTrigger>
            </TabsList>
            </Tabs>
        </div>
      </Card>

      {/* --- LIST TRANSAKSI --- */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                Tidak ada transaksi yang ditemukan{date ? ` pada tanggal ${format(date, "dd MMMM yyyy", { locale: id })}` : ''}.
            </div>
        ) : (
            filteredOrders.map((order) => {
                // Ambil item pertama untuk preview gambar & nama
                const firstItem = order.order_items[0];
                const otherItemsCount = order.order_items.length - 1;

                return (
                    <Card key={order.id} className="p-6 flex flex-col gap-4">
                        {/* Header Card */}
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-cyan-600" />
                                <span className="font-semibold text-sm">Belanja</span>
                                <span className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <Badge 
                                    variant={getStatusColor(order.status) as any}
                                    className={order.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-0' : ''}
                                >
                                    {statusMap[order.status] || order.status}
                                </Badge>
                                <span className="text-xs text-gray-400 ml-2 hidden sm:inline">{order.id}</span>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Image */}
                            <div className="relative h-20 w-20 flex-shrink-0 rounded-md border bg-gray-50 overflow-hidden">
                                <Image
                                    src={firstItem?.product_variants?.products?.image_url || '/img/placeholder.png'}
                                    alt="Product"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1">
                                <h4 className="font-bold text-base line-clamp-1">
                                    {firstItem?.product_variants?.products?.name}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    {firstItem?.quantity} barang x {formatCurrency(firstItem?.price_at_purchase)}
                                </p>
                                {otherItemsCount > 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        + {otherItemsCount} produk lainnya
                                    </p>
                                )}
                            </div>

                            {/* Total Price */}
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-gray-500">Total Belanja</p>
                                <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                            <button 
                                onClick={() => handleShowDetail(order)}
                                className="text-sm text-cyan-600 font-medium hover:underline mr-auto sm:mr-4"
                            >
                                Lihat Detail Transaksi
                            </button>

                            {order.status === 'pending_payment' ? (
                                <Button 
                                    className="w-full sm:w-auto bg-cyan text-white"
                                    onClick={() => handlePayNow(order.id)}
                                >
                                    Bayar Sekarang
                                </Button>
                            ) : (
                                <>
                                    {/* Tombol Ulas (UI Only) - Muncul jika Selesai */}
                                    {order.status === 'completed' && (
                                        <Button variant="outline" className="w-full sm:w-auto border-cyan text-cyan-600 hover:bg-cyan/10">
                                            Ulas
                                        </Button>
                                    )}
                                    
                                    {/* Tombol Beli Lagi - Selalu muncul kecuali pending payment */}
                                    <Button 
                                        className="w-full sm:w-auto bg-cyan hover:bg-cyan/90 text-white"
                                        onClick={() => handleBuyAgain(order.id)}
                                        disabled={isLoadingBuyAgain === order.id}
                                    >
                                        {isLoadingBuyAgain === order.id ? 'Memproses...' : 'Beli Lagi'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                );
            })
        )}
      </div>

      {/* Modal Detail */}
      <TransactionDetailDialog 
        isOpen={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        order={selectedOrder}
      />
    </div>
  );
}