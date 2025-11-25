'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { verifyPayment, updateShipping } from './actions';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  User, 
  CreditCard,
  Calendar,
  MapPin
} from 'lucide-react';

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State untuk Alert Dialog Konfirmasi
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'accept' | 'reject' | null>(null);

  if (!transaction) return null;

  const payment = transaction.payments?.[0];
  
  // Status Helper
  const isWaitingConfirmation = transaction.status === 'waiting_confirmation';
  const isProcessing = transaction.status === 'processing';
  const isShipped = transaction.status === 'shipped';
  const isCompleted = transaction.status === 'completed';

  // --- HANDLER TRIGGER ALERT ---
  const triggerVerify = (action: 'accept' | 'reject') => {
    setVerificationAction(action);
    setIsAlertOpen(true);
  };

  // --- EKSEKUSI VERIFIKASI SETELAH KONFIRMASI ---
  const executeVerify = () => {
    if (!verificationAction) return;
    const isValid = verificationAction === 'accept';

    startTransition(async () => {
      const res = await verifyPayment(transaction.id, isValid);
      
      if (res.success) {
        toast({ title: 'Berhasil', description: res.message });
        setIsAlertOpen(false); // Tutup alert
        onOpenChange(false);   // Tutup modal detail
        router.refresh();      // Refresh data halaman
      } else {
        toast({ title: 'Gagal', description: res.message, variant: 'destructive' });
        setIsAlertOpen(false);
      }
    });
  };

  // --- FORM PENGIRIMAN (COMPONENT INTERNAL) ---
  const ShippingForm = () => {
    const [state, formAction] = useFormState(updateShipping, { success: false, message: '' });

    useEffect(() => {
        if (state.success) {
            toast({ title: "Terkirim", description: state.message });
            onOpenChange(false); // Tutup modal otomatis
            router.refresh();    // Refresh data halaman
        } else if (state.message) {
            toast({ title: "Gagal", description: state.message, variant: "destructive" });
        }
    }, [state]);

    return (
      <form action={formAction} className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 text-blue-800">
            <Truck className="h-5 w-5" />
            <h4 className="font-semibold">Update Pengiriman</h4>
        </div>
        
        <input type="hidden" name="order_id" value={transaction.id} />
        
        <div className="space-y-2">
          <Label htmlFor="receipt_number" className="text-sm font-medium text-gray-700">
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
          <p className="text-xs text-blue-600/80">
            Menginput resi akan mengubah status pesanan menjadi "Dikirim" dan menutup jendela ini.
          </p>
        </div>
      </form>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Package className="h-5 w-5 text-cyan-600" />
                Order #{transaction.id.slice(0, 8)}
              </DialogTitle>
              <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-500">Status:</span>
                 <Badge variant={isProcessing ? 'default' : isWaitingConfirmation ? 'secondary' : 'outline'} className="capitalize text-sm px-3 py-1">
                    {transaction.status.replace('_', ' ')}
                 </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* KOLOM KIRI: Detail Pesanan */}
              <div className="space-y-6">
                
                {/* Informasi Pelanggan */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-gray-800">
                    <User className="h-4 w-4" /> Informasi Pelanggan
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm border">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama:</span>
                      <span className="font-medium">{transaction.profiles?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">No. Telpon:</span>
                      <span className="font-medium">{transaction.profiles?.no_telpon || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal Order:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alamat Pengiriman */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-gray-800">
                    <MapPin className="h-4 w-4" /> Alamat Pengiriman
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md text-sm border text-gray-700 leading-relaxed">
                    {transaction.shipping_address_street ? (
                      <>
                        <p>{transaction.shipping_address_street}</p>
                        <p>{transaction.shipping_address_city}, {transaction.shipping_address_province}</p>
                        <p className="font-medium mt-1">Kode Pos: {transaction.shipping_address_postal_code}</p>
                      </>
                    ) : (
                      <p className="italic text-gray-400">Alamat tidak tersedia</p>
                    )}
                  </div>
                  
                  {/* Tampilkan Resi Jika Ada */}
                  {(isShipped || isCompleted) && transaction.shipping_receipt_number && (
                     <div className="mt-2 flex items-center gap-2 text-sm bg-green-50 border border-green-200 p-2 rounded-md text-green-800">
                        <Truck className="h-4 w-4" />
                        <span className="font-semibold">Resi: {transaction.shipping_receipt_number}</span>
                     </div>
                  )}
                </div>

                <Separator />

                {/* Daftar Item */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Item Pesanan</h4>
                  <div className="space-y-3">
                    {transaction.order_items.map((item: any) => (
                      <div key={item.id} className="flex gap-3 items-start">
                        <div className="relative h-16 w-16 rounded border bg-white overflow-hidden flex-shrink-0">
                           <Image 
                              src={item.product_variants?.products?.image_url || '/img/placeholder.png'} 
                              alt="Produk" fill className="object-cover" 
                           />
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-gray-900 line-clamp-2">{item.product_variants?.products?.name}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Size: {item.product_variants?.size}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{formatCurrency(item.price_at_purchase)}</p>
                          <p className="text-gray-500 text-xs">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span className="text-cyan-600">{formatCurrency(transaction.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: Pembayaran & Aksi */}
              <div className="space-y-6">
                <h4 className="font-semibold flex items-center gap-2 text-gray-800">
                  <CreditCard className="h-4 w-4" /> Bukti Pembayaran
                </h4>

                <div className="bg-gray-50 rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-4 text-sm">
                     <span className="text-gray-500">Metode: <span className="font-medium text-gray-900 capitalize">{payment?.method?.replace('_', ' ')}</span></span>
                     <span className="text-gray-500">Status: <span className={payment?.status === 'verified' ? 'text-green-600 font-bold' : 'text-yellow-600 font-bold'}>{payment?.status || 'Pending'}</span></span>
                  </div>

                  {/* Gambar Bukti Pembayaran - FULL SIZE */}
                  {payment?.payment_proof_url ? (
                    <div className="relative w-full rounded-md overflow-hidden border bg-white">
                      <img 
                          src={payment.payment_proof_url} 
                          alt="Bukti Bayar" 
                          className="w-full h-auto max-h-[400px] object-contain mx-auto"
                      />
                      <a 
                        href={payment.payment_proof_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black/90 transition-colors"
                      >
                        Lihat Asli
                      </a>
                    </div>
                  ) : (
                     <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-gray-400">
                       <CreditCard className="h-8 w-8 mb-2 opacity-50" />
                       <span className="text-sm">Belum ada bukti pembayaran</span>
                     </div>
                  )}
                </div>

                {/* --- AREA AKSI (Action Area) --- */}
                <div className="space-y-4">
                  
                  {/* KASUS 1: Menunggu Konfirmasi -> Tombol Verifikasi */}
                  {isWaitingConfirmation && payment?.payment_proof_url && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-sm text-yellow-800 mb-2">Verifikasi Pembayaran</h5>
                      <p className="text-xs text-yellow-700 mb-4">
                        Cek kesesuaian nominal <b>{formatCurrency(transaction.total_amount)}</b> dengan bukti transfer di atas.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white w-full"
                          onClick={() => triggerVerify('accept')}
                          disabled={isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Valid (Proses)
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => triggerVerify('reject')}
                          disabled={isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Tidak Valid
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* KASUS 2: Sudah Diproses -> Form Input Resi */}
                  {isProcessing && (
                      <ShippingForm />
                  )}

                  {/* KASUS 3: Pesanan Selesai/Dikirim -> Info */}
                  {(isShipped || isCompleted) && (
                     <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-800 font-medium">Pesanan sedang dalam pengiriman atau selesai.</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ALERT DIALOG KONFIRMASI --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verificationAction === 'accept' ? 'Terima Pembayaran?' : 'Tolak Pembayaran?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verificationAction === 'accept' 
                ? 'Status pesanan akan berubah menjadi "Diproses". Pastikan dana sudah masuk ke rekening.' 
                : 'Status pesanan akan dikembalikan ke "Belum Bayar" dan pelanggan diminta upload ulang.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent auto close
                executeVerify();
              }}
              className={verificationAction === 'reject' ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
              {verificationAction === 'accept' ? 'Ya, Terima' : 'Ya, Tolak'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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