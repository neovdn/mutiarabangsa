'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderWithDetails } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils'; // Pastikan helper ini ada di utils.ts

interface TransactionDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithDetails | null;
}

export function TransactionDetailDialog({
  isOpen,
  onOpenChange,
  order,
}: TransactionDetailDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status & Info Dasar */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">No. Pesanan</span>
            <span className="font-medium text-sm">#{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Tanggal</span>
            <span className="text-sm">
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant="outline" className="capitalize">{order.status.replace('_', ' ')}</Badge>
          </div>

          <Separator />

          {/* Daftar Produk */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Produk yang dibeli</h4>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 rounded-md border bg-gray-50 overflow-hidden">
                  <Image
                    src={item.product_variants?.products?.image_url || '/img/placeholder.png'}
                    alt={item.product_variants?.products?.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium line-clamp-1">
                    {item.product_variants?.products?.name}
                  </p>
                  <p className="text-gray-500">
                    Size: {item.product_variants?.size} | {item.quantity} x {formatCurrency(item.price_at_purchase)}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(item.price_at_purchase * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Info Pengiriman (Jika ada) */}
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Info Pengiriman</h4>
            <p className="text-gray-600">
              {order.shipping_address_street}, {order.shipping_address_city}
            </p>
            {order.shipping_receipt_number && (
              <p className="text-cyan-600 font-medium">
                Resi: {order.shipping_receipt_number}
              </p>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Belanja</span>
            <span className="font-bold text-lg text-cyan-600">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}