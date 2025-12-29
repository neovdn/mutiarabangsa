'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Calendar as CalendarIcon, Clock, Filter, X, ChevronRight, Star, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { OrderWithDetails } from '@/types/order';
import { formatCurrency, cn } from '@/lib/utils';
import { buyAgain, completeOrder } from './actions';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import { ReviewDialog } from './review-dialog';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const [isLoadingBuyAgain, setIsLoadingBuyAgain] = useState<string | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const statusOptions = [
    { id: 'all', label: 'Semua Status' },
    { id: 'pending_payment', label: 'Belum Bayar' },
    { id: 'waiting_confirmation', label: 'Menunggu Konfirmasi' },
    { id: 'processing', label: 'Diproses' },
    { id: 'shipped', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Dibatalkan' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'destructive';
      case 'waiting_confirmation': return 'warning';
      case 'processing': return 'default';
      case 'shipped': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        order.order_items.some(item => 
          item.product_variants?.products?.name.toLowerCase().includes(searchLower)
        );

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        matchesStatus = order.status === statusFilter;
      }

      let matchesDate = true;
      if (date) {
          const orderDate = new Date(order.created_at);
          matchesDate = 
            orderDate.getDate() === date.getDate() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [initialOrders, searchTerm, statusFilter, date]);

  const handleBuyAgain = async (orderId: string) => {
    setIsLoadingBuyAgain(orderId);
    const result = await buyAgain(orderId);
    
    if (result.success) {
      toast({ title: "Berhasil!", description: "Produk ditambahkan ke keranjang." });
      router.push('/dashboard/customer/cart');
    } else {
      toast({ title: "Gagal", description: result.message, variant: "destructive" });
    }
    setIsLoadingBuyAgain(null);
  };

  const handleCompleteOrder = async (orderId: string) => {
    if(!confirm("Apakah Anda yakin pesanan sudah diterima dengan baik?")) return;

    setIsLoadingComplete(orderId);
    const result = await completeOrder(orderId);
    
    if (result.success) {
      toast({ title: "Pesanan Selesai", description: "Terima kasih telah berbelanja!" });
      router.refresh();
    } else {
      toast({ title: "Gagal", description: result.message, variant: "destructive" });
    }
    setIsLoadingComplete(null);
  };

  const handleShowDetail = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handlePayNow = (orderId: string) => {
    router.push(`/dashboard/customer/orders/${orderId}/payment`);
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDate(undefined);
  };

  const handleOpenReview = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsReviewOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* SEARCH BAR */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
         <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Cari pesanan berdasarkan ID atau nama produk..." 
              className="pl-12 h-11 text-sm border-gray-200 focus:border-[#E8207E] focus:ring-[#E8207E] rounded-xl transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* SIDEBAR FILTER */}
        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 space-y-4">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#E8207E]" /> Filter
                </h3>
                {(statusFilter !== 'all' || date) && (
                  <button onClick={handleResetFilter} className="text-xs text-red-500 hover:underline font-medium">
                    Reset
                  </button>
                )}
              </div>
              
              <ScrollArea className="h-auto max-h-[calc(100vh-200px)]">
                <div className="p-3 space-y-6">
                   {/* Filter Tanggal */}
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-10 rounded-xl border-gray-200", !date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "dd MMM yyyy", { locale: id }) : <span className="text-xs">Pilih Tanggal</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                   </div>

                   {/* Filter Status */}
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Pesanan</label>
                      <div className="space-y-1">
                         {statusOptions.map((option) => (
                            <button
                               key={option.id}
                               onClick={() => setStatusFilter(option.id)}
                               className={cn(
                                  "w-full text-left text-xs py-2 px-3 rounded-lg transition-all flex items-center justify-between",
                                  statusFilter === option.id 
                                    ? "bg-[#E8207E]/10 text-[#E8207E] font-bold" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                               )}
                            >
                               {option.label}
                               {statusFilter === option.id && <div className="w-1.5 h-1.5 rounded-full bg-[#E8207E]" />}
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
              </ScrollArea>
           </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 w-full min-w-0">
           <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs text-gray-500 font-medium">
                Menampilkan <span className="font-bold text-gray-900">{filteredOrders.length}</span> transaksi
              </p>
           </div>

           <div className="space-y-3">
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="h-8 w-8 text-gray-300" />
                   </div>
                   <h3 className="text-lg font-semibold text-gray-900">Tidak ada transaksi</h3>
                   <p className="text-gray-500 text-sm mt-1">Coba ubah filter atau tanggal pencarian.</p>
                </div>
            ) : (
                filteredOrders.map((order) => {
                    const firstItem = order.order_items[0];
                    const otherItemsCount = order.order_items.length - 1;
                    
                    const orderDateObj = new Date(order.created_at);
                    const dateStr = orderDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                    const timeStr = orderDateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

                    return (
                        <Card key={order.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group">
                            {/* Header Card */}
                            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm">
                                       <ShoppingBag className="h-4 w-4 text-[#E8207E]" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-bold text-gray-800">Belanja</span>
                                       <span className="text-[10px] text-gray-500">{dateStr} • {timeStr}</span>
                                    </div>
                                </div>
                                <Badge 
                                    variant={getStatusColor(order.status) as any}
                                    className={cn(
                                      "capitalize font-semibold shadow-none",
                                      order.status === 'waiting_confirmation' && 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0',
                                      order.status === 'completed' && 'bg-green-100 text-green-700 hover:bg-green-200 border-0',
                                      order.status === 'pending_payment' && 'bg-red-100 text-red-700 hover:bg-red-200 border-0',
                                      order.status === 'processing' && 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-0'
                                    )}
                                >
                                    {order.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            {/* Body Card */}
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                                    {/* Gambar */}
                                    <div className="relative h-16 w-16 flex-shrink-0 rounded-xl border bg-gray-50 overflow-hidden">
                                        <Image
                                            src={firstItem?.product_variants?.products?.image_url || '/img/placeholder.png'}
                                            alt="Product"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    
                                    {/* Detail */}
                                    <div className="flex-1 w-full text-center sm:text-left">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                            {firstItem?.product_variants?.products?.name}
                                        </h4>
                                        <div className="text-xs text-gray-500 mt-1 flex flex-col sm:flex-row gap-1 sm:gap-3 items-center sm:items-start justify-center sm:justify-start">
                                            <span>Size: {firstItem?.product_variants?.size}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>{firstItem?.quantity} x {formatCurrency(firstItem?.price_at_purchase)}</span>
                                        </div>
                                        {otherItemsCount > 0 && (
                                            <p className="text-xs text-gray-400 mt-1.5 font-medium">
                                                +{otherItemsCount} produk lainnya
                                            </p>
                                        )}
                                    </div>

                                    {/* Total & Harga */}
                                    <div className="text-center sm:text-right pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 w-full sm:w-auto mt-2 sm:mt-0">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Total Belanja</p>
                                        <p className="font-bold text-[#E8207E] text-base">{formatCurrency(order.total_amount)}</p>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Footer Card (Actions) */}
                            <CardFooter className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 flex-wrap">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleShowDetail(order)}
                                    className="text-xs text-gray-600 hover:text-[#E8207E] hover:bg-white"
                                >
                                    Lihat Detail
                                </Button>

                                {order.status === 'pending_payment' ? (
                                    <Button 
                                        size="sm"
                                        className="h-8 text-xs bg-[#E8207E] hover:bg-[#E8207E]/90 text-white rounded-lg shadow-sm"
                                        onClick={() => handlePayNow(order.id)}
                                    >
                                        Bayar Sekarang
                                    </Button>
                                ) : order.status === 'shipped' ? (
                                    <Button 
                                        size="sm"
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
                                        onClick={() => handleCompleteOrder(order.id)}
                                        disabled={isLoadingComplete === order.id}
                                    >
                                        {isLoadingComplete === order.id ? (
                                            <span className="animate-pulse">Memproses...</span>
                                        ) : (
                                            <>
                                              <CheckCircle className="h-3.5 w-3.5" />
                                              Pesanan Diterima
                                            </>
                                        )}
                                    </Button>
                                ) : order.status === 'completed' ? (
                                    <>
                                        <Button 
                                            size="sm"
                                            className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm flex items-center gap-1"
                                            onClick={() => handleOpenReview(order)}
                                        >
                                            <Star className="h-3 w-3" />
                                            Beri Rating
                                        </Button>
                                        <Button 
                                            size="sm"
                                            className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-sm"
                                            onClick={() => handleBuyAgain(order.id)}
                                            disabled={isLoadingBuyAgain === order.id}
                                        >
                                            {isLoadingBuyAgain === order.id ? (
                                                <span className="animate-pulse">Memproses...</span>
                                            ) : (
                                                'Beli Lagi'
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    order.status !== 'waiting_confirmation' && (
                                        <Button 
                                            size="sm"
                                            className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-sm"
                                            onClick={() => handleBuyAgain(order.id)}
                                            disabled={isLoadingBuyAgain === order.id}
                                        >
                                            {isLoadingBuyAgain === order.id ? (
                                                <span className="animate-pulse">Memproses...</span>
                                            ) : (
                                                'Beli Lagi'
                                            )}
                                        </Button>
                                    )
                                )}
                            </CardFooter>
                        </Card>
                    );
                })
            )}
           </div>
        </div>
      </div>

      <TransactionDetailDialog 
        isOpen={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        order={selectedOrder}
      />

      <ReviewDialog 
        isOpen={isReviewOpen} 
        onOpenChange={setIsReviewOpen} 
        order={selectedOrder}
      />
    </div>
  );
}