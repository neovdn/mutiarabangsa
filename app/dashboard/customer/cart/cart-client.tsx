'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createOrderFromCart, CheckoutFormState } from '../checkout/actions';
import { 
  updateCartItemQuantity, 
  deleteCartItem, 
  clearCart 
} from './actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Trash2, Plus, Minus, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Tipe data yang diterima dari server (sesuai page.tsx)
type CartItemWithDetails = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    size: string;
    price: number;
    stock: number;
    products: {
      id: string;
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

function CheckoutButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      size="lg" 
      className="w-full bg-[#E8207E] hover:bg-[#E8207E]/90 text-white font-bold rounded-xl shadow-md h-12 text-base" 
      disabled={pending || disabled}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Checkout Sekarang <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </Button>
  );
}

interface CartClientProps {
  cartItems: CartItemWithDetails[];
}

export function CartClient({ cartItems }: CartClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const initialState: CheckoutFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(createOrderFromCart, initialState);

  // Hitung Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product_variants?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // Total Item Count
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleDeleteItem = (itemId: string) => {
    if(!confirm("Hapus item ini dari keranjang?")) return;

    startTransition(async () => {
       const result = await deleteCartItem(itemId);
       if (result.success) {
         toast({ title: "Berhasil", description: result.message });
       } else {
         toast({ title: "Gagal", description: result.message, variant: "destructive" });
       }
    });
  };

  const handleUpdateQuantity = (itemId: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change;

    if (newQty === 0) {
        handleDeleteItem(itemId);
        return;
    }

    if (newQty < 1) return;

    if (newQty > maxStock) {
        toast({
            title: "Stok Maksimal",
            description: `Hanya tersedia ${maxStock} item untuk produk ini.`,
            variant: "destructive"
        });
        return;
    }

    startTransition(async () => {
      const result = await updateCartItemQuantity(itemId, newQty);
      if (!result.success) {
        toast({ title: "Gagal", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleClearCart = () => {
    if(!confirm("Anda yakin ingin mengosongkan semua keranjang?")) return;

    startTransition(async () => {
        const result = await clearCart();
        if (result.success) {
          toast({ title: "Keranjang Dikosongkan" });
        } else {
          toast({ title: "Gagal", description: result.message, variant: "destructive" });
        }
     });
  };

  // --- TAMPILAN KOSONG ---
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Keranjang Anda Kosong</h3>
        <p className="text-gray-500 max-w-md mb-8">
          Sepertinya Anda belum menambahkan produk apapun. Yuk, cari perlengkapan sekolahmu sekarang!
        </p>
        <Button asChild className="bg-[#E8207E] hover:bg-[#E8207E]/90 text-white rounded-xl px-8 py-6">
          <Link href="/dashboard/customer/catalog">Mulai Belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* --- KOLOM KIRI: DAFTAR ITEM --- */}
        <div className="flex-1 w-full space-y-4">
          
          {/* Tombol Kosongkan */}
          <div className="flex justify-end">
             <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleClearCart}
                disabled={isPending}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
             >
                <Trash2 className="mr-2 h-3 w-3" />
                Kosongkan Keranjang
             </Button>
          </div>

          {/* List Items */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const variant = item.product_variants;
              const product = variant?.products;
              const price = variant?.price || 0;
              const total = price * item.quantity;
              const stock = variant?.stock || 0;

              return (
                <Card key={item.id} className="overflow-hidden rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      
                      {/* Gambar Produk */}
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-xl border bg-gray-50 overflow-hidden">
                        <Image
                          src={product?.image_url || '/img/placeholder.png'}
                          alt={product?.name || 'Produk'}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Detail Item */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                             <h3 className="font-bold text-gray-900 text-base line-clamp-2 pr-4">
                               {product?.name}
                             </h3>
                             <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={isPending}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                             >
                               <Trash2 className="h-4 w-4" />
                             </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600 border-0">
                               Size: {variant?.size}
                             </Badge>
                             {item.quantity > stock && (
                                <Badge variant="destructive" className="text-[10px]">Stok Kurang</Badge>
                             )}
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-3">
                           {/* Kontrol Jumlah (Style Dialog) */}
                           <div className="flex items-center gap-0 bg-gray-50 rounded-lg border border-gray-200 h-9">
                              <button 
                                type="button" 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1, stock)}
                                disabled={isPending}
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-l-lg transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <div className="w-10 text-center text-sm font-semibold border-x border-gray-200 bg-white h-full flex items-center justify-center">
                                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : item.quantity}
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1, stock)}
                                disabled={isPending || item.quantity >= stock}
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                           </div>

                           {/* Harga */}
                           <div className="text-right">
                              <p className="text-xs text-gray-500 mb-0.5">{item.quantity} x {formatCurrency(price)}</p>
                              <p className="text-base font-bold text-[#E8207E]">{formatCurrency(total)}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* --- KOLOM KANAN: RINGKASAN (STICKY) --- */}
        <div className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-24 space-y-6">
           <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
              <div className="p-5 bg-gray-50/50 border-b border-gray-100">
                 <h3 className="font-bold text-gray-900 text-lg">Ringkasan Pesanan</h3>
              </div>
              <CardContent className="p-6 space-y-4">
                 <div className="flex justify-between text-sm text-gray-600">
                    <span>Total Item</span>
                    <span className="font-medium text-gray-900">{totalItemsCount} pcs</span>
                 </div>
                 <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                 </div>
                 
                 <div className="border-t border-dashed border-gray-200 my-2"></div>
                 
                 <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-gray-800">Total Tagihan</span>
                    <span className="text-xl font-bold text-[#E8207E]">{formatCurrency(subtotal)}</span>
                 </div>

                 {!state.success && state.message && (
                    <Alert variant="destructive" className="mt-4 py-2 px-3 text-xs rounded-lg bg-red-50 border-red-200 text-red-700">
                      <AlertCircle className="h-3 w-3" />
                      <AlertTitle className="text-xs font-bold ml-2">Gagal</AlertTitle>
                      <AlertDescription className="ml-2 mt-0.5">{state.message}</AlertDescription>
                    </Alert>
                 )}

                 <div className="pt-4">
                    <CheckoutButton disabled={isPending} />
                    <p className="text-[10px] text-gray-400 text-center mt-3">
                       *Pastikan stok tersedia sebelum checkout. Harga belum termasuk ongkir.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </div>

      </div>
    </form>
  );
}