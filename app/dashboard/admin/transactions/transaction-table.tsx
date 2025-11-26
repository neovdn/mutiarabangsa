'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CalendarDays, User, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TransactionTableProps {
  transactions: any[];
  onViewDetail: (trx: any) => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Belum Bayar', color: 'destructive' },
  waiting_confirmation: { label: 'Perlu Cek', color: 'warning' }, // Diubah agar lebih jelas
  processing: { label: 'Diproses', color: 'default' },
  shipped: { label: 'Dikirim', color: 'secondary' },
  completed: { label: 'Selesai', color: 'outline' },
  cancelled: { label: 'Batal', color: 'destructive' },
};

const formatMethod = (method: string) => {
  if (!method) return '-';
  if (method.toLowerCase() === 'cod') return 'COD';
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function TransactionTable({ transactions, onViewDetail }: TransactionTableProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-600">Order ID</TableHead>
            <TableHead className="font-semibold text-gray-600">Pelanggan</TableHead>
            <TableHead className="font-semibold text-gray-600">Tanggal</TableHead>
            <TableHead className="font-semibold text-gray-600">Total</TableHead>
            <TableHead className="font-semibold text-gray-600">Metode</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            <TableHead className="text-right font-semibold text-gray-600">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                   <FileText className="h-8 w-8 text-gray-300" />
                   <p>Tidak ada transaksi ditemukan.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((trx) => {
              const statusInfo = statusMap[trx.status] || { label: trx.status, color: 'secondary' };
              const paymentInfo = trx.payments?.[0];
              
              return (
                <TableRow key={trx.id} className="hover:bg-cyan-50/30 transition-colors border-gray-100">
                  <TableCell className="font-mono text-xs font-medium text-gray-700">
                    #{trx.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                         <User className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">{trx.profiles?.full_name || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-500">{trx.profiles?.no_telpon || '-'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                       <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                       {new Date(trx.created_at).toLocaleDateString('id-ID', {
                         day: 'numeric', month: 'short', year: '2-digit'
                       })}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-cyan-700">
                    {formatCurrency(trx.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-600 border-gray-200 font-normal">
                      {formatMethod(paymentInfo?.method)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                       // @ts-ignore 
                      variant={statusInfo.color === 'warning' ? 'secondary' : statusInfo.color as any}
                      className={
                        trx.status === 'waiting_confirmation' 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-0' 
                          : trx.status === 'completed'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border-0'
                          : ''
                      }
                    >
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetail(trx)}
                      className="hover:text-cyan-700 hover:bg-cyan-50 rounded-lg"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}