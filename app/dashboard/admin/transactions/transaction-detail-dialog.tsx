'use client';

import { useState, useTransition, useEffect } from 'react'; // Tambah useEffect
import Image from 'next/image';
import { useFormState, useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { formatCurrency } from '@/lib/utils';
import { verifyPayment, updateShipping } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Truck, Package } from 'lucide-react';

interface TransactionDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any | null;
}

export function TransactionDetailDialog({
  isOpen,
  onOpenChange,
  transaction,
}: TransactionDetailDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  if (!transaction) return null;

  const payment = transaction.payments?.[0];
  
  // Status Helper
  const isWaitingConfirmation = transaction.status === 'waiting_confirmation';
  const isProcessing = transaction.status === 'processing';
  const isShipped = transaction.status === 'shipped';

  // --- HANDLER VERIFIKASI ---
  const handleVerify = (isValid: boolean) => {
    if (!confirm(isValid ? 'Terima pembayaran ini?' : 'Tolak pembayaran ini?')) return;

    startTransition(async () => {
      const res = await verifyPayment(transaction.id, isValid);
      if (res.success) {
        toast({ title: 'Berhasil', description: res.message });
        // Kita tidak close modal otomatis agar admin bisa lanjut input resi jika mau (opsional)
        // onOpenChange(false); 
      } else {
        toast({ title: 'Gagal', description: res.message, variant: 'destructive' });
      }
    });
  };

  // --- FORM PENGIRIMAN (COMPONENT INTERNAL) ---
  const ShippingForm = () => {
    const [state, formAction] = useFormState(updateShipping, { success: false, message: '' });

    // Efek samping untuk menutup modal/toast jika sukses
    useEffect(() => {
        if (state.success) {
            toast({ title: "Terkirim", description: state.message });
            onOpenChange(false);
        } else if (state.message) {
            toast({ title: "Gagal", description: state.message, variant: "destructive" });
        }
    }, [state, toast]);

    return (
      <form action={formAction} className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-4 space-y-3">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Truck className="h-4 w-4" />
            <h4 className="font-semibold text-sm">Atur Pengiriman</h4>
        </div>
        
        <input type="hidden" name="order_id" value={transaction.id} />
        
        <div className="grid gap-2">
          <Label htmlFor="receipt_number" className="text-xs font-medium text-gray-600">
             Masukkan Nomor Resi
          </Label>
          <div className="flex gap-2">
            <Input 
              id="receipt_number" 
              name="receipt_number" 
              placeholder="Contoh: JP123456789" 
              required 
              className="bg-white"
            />
            <ShippingSubmitButton />
          </div>
        </div>
      </form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-cyan-600" />
            Detail Pesanan #{transaction.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {/* FIX SCROLL: Menggunakan ScrollArea untuk konten di tengah.
           h-full memastikan dia mengisi ruang yang tersedia antara header dan footer.
        */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-8rem)] w-full"> 
          <div className="px-6 py-6 space-y-6">
            
            {/* 1. Status Bar & Info User */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pelanggan</p>
                <p className="font-semibold text-sm">{transaction.profiles?.full_name}</p>
                <p className="text-xs text-gray-500">{transaction.profiles?.no_telpon || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status Pesanan</p>
                <Badge variant={isProcessing ? 'default' : isWaitingConfirmation ? 'secondary' : 'outline'} className="capitalize">
                  {transaction.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* 2. Daftar Barang */}
            <div>
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Item Pesanan</h4>
              <div className="border rounded-md divide-y">
                {transaction.order_items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-3 hover:bg-gray-50/50 transition-colors">
                    <div className="relative h-14 w-14 rounded border bg-white overflow-hidden flex-shrink-0">
                       <Image 
                          src={item.product_variants?.products?.image_url || '/img/placeholder.png'} 
                          alt="Produk" fill className="object-cover" 
                       />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.product_variants?.products?.name}</p>
                      <p className="text-gray-500 mt-1">
                        Size: <span className="font-medium text-gray-700">{item.product_variants?.size}</span>
                      </p>
                      <p className="text-gray-500">
                        {item.quantity} x {formatCurrency(item.price_at_purchase)}
                      </p>
                    </div>
                    <div className="font-medium text-sm self-center">
                      {formatCurrency(item.price_at_purchase * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t font-bold text-gray-900">
                <span>Total Tagihan</span>
                <span className="text-lg text-cyan-600">{formatCurrency(transaction.total_amount)}</span>
              </div>
            </div>

            <Separator />

            {/* 3. Bukti Pembayaran */}
            <div>
              <h4 className="font-semibold text-sm mb-3 text-gray-700">Bukti Pembayaran</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                   <div>
                      <p className="text-gray-500 text-xs">Metode Pembayaran</p>
                      <p className="font-medium capitalize">{payment?.method?.replace('_', ' ')}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Status Pembayaran</p>
                      <Badge variant={payment?.status === 'verified' ? 'default' : 'outline'} className="mt-1">
                        {payment?.status || 'Pending'}
                      </Badge>
                   </div>
                </div>

                {/* Container Gambar agar tidak terpotong */}
                {payment?.payment_proof_url ? (
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <div className="relative w-full aspect-[3/4] md:aspect-video rounded overflow-hidden cursor-zoom-in group">
                        {/* Buka gambar tab baru saat diklik */}
                        <a href={payment.payment_proof_url} target="_blank" rel="noreferrer">
                            <Image 
                                src={payment.payment_proof_url} 
                                alt="Bukti Bayar" 
                                fill 
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        </a>
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-white text-xs font-medium">Klik untuk memperbesar</span>
                        </div>
                    </div>
                  </div>
                ) : (
                   <div className="h-32 flex items-center justify-center border border-dashed rounded bg-gray-50 text-gray-400 text-sm">
                     Tidak ada bukti pembayaran
                   </div>
                )}
              </div>
            </div>

            {/* --- AREA AKSI (Action Area) --- */}
            
            {/* KASUS 1: Menunggu Konfirmasi -> Tampilkan Tombol Verifikasi */}
            {isWaitingConfirmation && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                      <CheckCircle className="h-4 w-4" />
                   </div>
                   <div className="flex-1">
                      <h5 className="font-semibold text-sm text-yellow-800">Verifikasi Pembayaran</h5>
                      <p className="text-xs text-yellow-700 mt-1 mb-3">
                        Pastikan bukti transfer valid dan sesuai dengan total tagihan sebelum menerima pesanan.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleVerify(true)}
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                          Terima (Valid)
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleVerify(false)}
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="h-4 w-4 mr-2" />}
                          Tolak (Invalid)
                        </Button>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* KASUS 2: Sudah Diproses (Verified) -> Tampilkan Form Input Resi */}
            {isProcessing && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <ShippingForm />
                </div>
            )}

            {/* KASUS 3: Sudah Dikirim -> Tampilkan Info Resi */}
            {isShipped && transaction.shipping_receipt_number && (
               <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                     <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Nomor Resi Pengiriman</p>
                    <p className="font-mono font-semibold text-green-900 text-lg">
                        {transaction.shipping_receipt_number}
                    </p>
                  </div>
               </div>
            )}

          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShippingSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Kirim'}
    </Button>
  );
}