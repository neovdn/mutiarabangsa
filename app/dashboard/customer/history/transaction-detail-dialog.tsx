'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OrderWithDetails, OrderItemWithDetails } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Star } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link'; // Import Link

interface TransactionDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderWithDetails | null;
  onReview?: (item: OrderItemWithDetails) => void;
}

export function TransactionDetailDialog({
  isOpen,
  onOpenChange,
  order,
  onReview,
}: TransactionDetailDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Info Header */}
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

          {/* List Produk */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Produk yang dibeli</h4>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex gap-3 items-start">
                
                {/* Gambar (Bisa diklik ke detail produk) */}
                <Link 
                   href={`/dashboard/customer/catalog/products/${item.product_variants?.products?.id}`}
                   className="relative h-16 w-16 flex-shrink-0 rounded-md border bg-gray-50 overflow-hidden cursor-pointer"
                >
                  <Image
                    src={item.product_variants?.products?.image_url || '/img/placeholder.png'}
                    alt={item.product_variants?.products?.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 text-sm flex flex-col justify-between h-full min-h-[4rem]">
                  <div>
                    <Link 
                       href={`/dashboard/customer/catalog/products/${item.product_variants?.products?.id}`}
                       className="font-medium line-clamp-1 hover:text-[#E8207E] transition-colors"
                    >
                      {item.product_variants?.products?.name}
                    </Link>
                    <p className="text-gray-500 text-xs mt-1">
                      Size: {item.product_variants?.size} | {item.quantity} x {formatCurrency(item.price_at_purchase)}
                    </p>
                  </div>
                  <div className="font-medium mt-1">
                    Total: {formatCurrency(item.price_at_purchase * item.quantity)}
                  </div>
                </div>

                {/* Logika Tombol Review */}
                {order.status === 'completed' && (
                  <div className="flex-shrink-0 flex items-center h-16">
                    {item.is_reviewed ? (
                      <div className="flex flex-col items-end gap-1">
                         <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 text-[10px] border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Dinilai
                        </Badge>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs border-[#E8207E] text-[#E8207E] hover:bg-pink-50"
                        onClick={() => onReview && onReview(item)}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Ulas
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Info Pengiriman</h4>
            <p className="text-gray-600">
              {order.shipping_address_street}, {order.shipping_address_city}
            </p>
            {order.shipping_receipt_number && (
              <p className="text-[#E8207E] font-medium">
                Resi: {order.shipping_receipt_number}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-bold">Total Belanja</span>
            <span className="font-bold text-lg text-[#E8207E]">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}