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
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TransactionTableProps {
  transactions: any[];
  onViewDetail: (trx: any) => void;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Belum Bayar', color: 'destructive' },
  waiting_confirmation: { label: 'Menunggu Konfirmasi', color: 'warning' }, 
  processing: { label: 'Diproses (Siap Kirim)', color: 'default' },
  shipped: { label: 'Dikirim', color: 'secondary' },
  completed: { label: 'Selesai', color: 'outline' },
  cancelled: { label: 'Batal', color: 'destructive' },
};

// Helper untuk format metode pembayaran (misal: cod -> COD)
const formatMethod = (method: string) => {
  if (!method) return '-';
  if (method.toLowerCase() === 'cod') return 'COD';
  return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function TransactionTable({ transactions, onViewDetail }: TransactionTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                Tidak ada transaksi ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((trx) => {
              const statusInfo = statusMap[trx.status] || { label: trx.status, color: 'secondary' };
              const paymentInfo = trx.payments?.[0];
              
              return (
                <TableRow key={trx.id}>
                  <TableCell className="font-mono text-xs">
                    #{trx.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{trx.profiles?.full_name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{trx.profiles?.no_telpon || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(trx.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(trx.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {formatMethod(paymentInfo?.method)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                       // @ts-ignore 
                      variant={statusInfo.color === 'warning' ? 'secondary' : statusInfo.color as any}
                      className={trx.status === 'waiting_confirmation' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0' : ''}
                    >
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetail(trx)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
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