'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TransactionTable } from './transaction-table';
import { TransactionDetailDialog } from './transaction-detail-dialog';

interface TransactionClientProps {
  initialTransactions: any[];
}

export function TransactionClient({ initialTransactions }: TransactionClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter((trx) => {
      const customerName = trx.profiles?.full_name || '';
      const orderId = trx.id || '';
      
      const matchesSearch = 
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orderId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || trx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialTransactions, searchTerm, statusFilter]);

  const handleViewDetail = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari Order ID atau Nama Pelanggan..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter Status" />
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
      </div>

      {/* Table */}
      <TransactionTable 
        transactions={filteredTransactions} 
        onViewDetail={handleViewDetail} 
      />

      {/* Dialog Detail */}
      <TransactionDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}