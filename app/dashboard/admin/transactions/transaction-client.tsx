'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TransactionTable } from './transaction-table';
import { TransactionDetailDialog } from './transaction-detail-dialog';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TransactionClientProps {
  initialTransactions: any[];
}

export function TransactionClient({ initialTransactions }: TransactionClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((trx) => {
      const customerName = trx.profiles?.full_name || '';
      const orderId = trx.id || '';
      const searchLower = searchTerm.toLowerCase();
      
      // Filter Search
      const matchesSearch = 
        customerName.toLowerCase().includes(searchLower) ||
        orderId.toLowerCase().includes(searchLower);

      // Filter Status
      const matchesStatus = 
        statusFilter === 'all' || trx.status === statusFilter;

      // Filter Tanggal
      let matchesDate = true;
      if (dateFilter) {
        const trxDate = new Date(trx.created_at);
        matchesDate = 
          trxDate.getDate() === dateFilter.getDate() &&
          trxDate.getMonth() === dateFilter.getMonth() &&
          trxDate.getFullYear() === dateFilter.getFullYear();
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [initialTransactions, searchTerm, statusFilter, dateFilter]);

  const handleViewDetail = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter(undefined);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter;

  return (
    <div className="space-y-6">
      
      {/* --- TOOLBAR TERPUSAT --- */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-2 justify-center max-w-4xl mx-auto">
         
         {/* 1. Search (Diperkecil) */}
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Cari Order ID / Nama..." 
              className="pl-9 h-10 text-sm border-transparent bg-gray-50 focus:bg-white focus:border-cyan-600 focus:ring-cyan-600 rounded-xl transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Divider Vertical (Desktop Only) */}
         <div className="hidden md:block w-px h-6 bg-gray-200 mx-1"></div>

         {/* 2. Date Filter */}
         <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full md:w-48 justify-start text-left font-normal h-10 rounded-xl border-transparent bg-gray-50 hover:bg-white hover:border-cyan-200 text-gray-600",
                  dateFilter && "text-cyan-700 bg-cyan-50 border-cyan-200 font-medium"
                )}
              >
                <CalendarIcon className={cn("mr-2 h-4 w-4", dateFilter ? "text-cyan-600" : "text-gray-400")} />
                {dateFilter ? format(dateFilter, "dd MMM yyyy", { locale: id }) : <span>Filter Tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
         </Popover>

         {/* 3. Status Filter */}
         <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={cn(
                "w-full md:w-48 h-10 rounded-xl border-transparent bg-gray-50 hover:bg-white hover:border-cyan-200 text-gray-600 focus:ring-cyan-600",
                statusFilter !== 'all' && "text-cyan-700 bg-cyan-50 border-cyan-200 font-medium"
            )}>
              <div className="flex items-center gap-2">
                 <Filter className={cn("h-4 w-4", statusFilter !== 'all' ? "text-cyan-600" : "text-gray-400")} />
                 <SelectValue placeholder="Semua Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="waiting_confirmation">Menunggu Konfirmasi</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="shipped">Dikirim</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
         </Select>

         {/* 4. Reset Button (Muncul jika ada filter aktif) */}
         {hasActiveFilters && (
            <Button 
                variant="ghost" 
                size="icon"
                onClick={clearFilters} 
                className="h-10 w-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                title="Reset Filter"
            >
                <X className="h-4 w-4" />
            </Button>
         )}
      </div>

      {/* --- INFO RESULT --- */}
      <div className="text-center">
         <p className="text-xs text-gray-500 font-medium">
           Menampilkan <span className="font-bold text-gray-900">{filteredTransactions.length}</span> transaksi
         </p>
      </div>

      {/* --- TABLE (Sudah Center karena parent div max-w-6xl mx-auto) --- */}
      <div className="min-h-[400px]">
         <TransactionTable 
           transactions={filteredTransactions} 
           onViewDetail={handleViewDetail} 
         />
      </div>

      {/* Dialog Detail */}
      <TransactionDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}