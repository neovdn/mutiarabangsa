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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
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

// Helper format mata uang
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
    <Button size="lg" className="w-full md:w-auto" disabled={pending || disabled}>
      {pending ? 'Memproses...' : 'Checkout Sekarang'}
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

  // Handler: Hapus Item (Digunakan juga saat qty turun ke 0)
  const handleDeleteItem = (itemId: string) => {
    // Konfirmasi sebelum hapus untuk mencegah ketidaksengajaan
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

  // Handler: Ubah Jumlah
  const handleUpdateQuantity = (itemId: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change;

    // --- UX UPDATE: Jika Qty jadi 0, picu penghapusan ---
    if (newQty === 0) {
        handleDeleteItem(itemId);
        return;
    }
    // ---------------------------------------------------

    if (newQty < 1) return; // Mencegah nilai negatif (safety guard)

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
        toast({
             title: "Gagal",
             description: result.message,
             variant: "destructive"
        });
      }
    });
  };

  // Handler: Kosongkan Keranjang
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

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle>Daftar Pesanan</CardTitle>
                {cartItems.length > 0 && (
                    <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleClearCart}
                        disabled={isPending}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Kosongkan
                    </Button>
                )}
            </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Produk</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item) => {
                  const variant = item.product_variants;
                  const product = variant?.products;
                  const price = variant?.price || 0;
                  const total = price * item.quantity;
                  const stock = variant?.stock || 0;

                  return (
                    <TableRow key={item.id}>
                      {/* Gambar */}
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md border bg-gray-50 overflow-hidden">
                            <Image
                                src={product?.image_url || '/img/placeholder.png'}
                                alt={product?.name || 'Produk'}
                                fill
                                className="object-cover"
                            />
                        </div>
                      </TableCell>

                      {/* Nama & Ukuran */}
                      <TableCell>
                        <p className="font-medium line-clamp-2">{product?.name}</p>
                        <Badge variant="outline" className="mt-1">Size: {variant?.size}</Badge>
                        {item.quantity > stock && (
                            <p className="text-xs text-red-500 mt-1">Stok Kurang!</p>
                        )}
                      </TableCell>

                      {/* Kontrol Jumlah */}
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1, stock)}
                                disabled={isPending} // <-- UX UPDATE: Tombol tetap aktif meski qty = 1
                            >
                                {/* Ganti icon jadi Trash jika qty = 1 untuk visual cue yang lebih baik (opsional), 
                                    atau tetap Minus tapi fungsinya delete */}
                                {item.quantity === 1 ? <Trash2 className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3" />}
                            </Button>
                            
                            <span className="w-8 text-center font-medium">
                                {isPending ? <Loader2 className="h-3 w-3 animate-spin mx-auto"/> : item.quantity}
                            </span>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1, stock)}
                                disabled={isPending || item.quantity >= stock}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-1">
                            Stok: {stock}
                        </div>
                      </TableCell>

                      {/* Harga Satuan */}
                      <TableCell className="text-right">
                        {formatCurrency(price)}
                      </TableCell>

                      {/* Total Harga Item */}
                      <TableCell className="text-right font-medium">
                        {formatCurrency(total)}
                      </TableCell>

                      {/* Tombol Hapus Langsung */}
                      <TableCell>
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isPending}
                         >
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold text-base">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right font-bold text-base text-cyan-600">
                    {formatCurrency(subtotal)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>

          {/* Footer Checkout */}
          <CardFooter className="flex flex-col md:flex-row items-end justify-between p-6 gap-4 border-t bg-gray-50/50">
             <div className="w-full md:w-2/3">
                {!state.success && state.message && (
                    <Alert variant="destructive" className="mb-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Checkout Gagal</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
             </div>
            
             <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                 <CheckoutButton disabled={cartItems.length === 0 || isPending} />
                 <p className="text-xs text-gray-500">
                    *Pastikan stok tersedia sebelum checkout
                 </p>
             </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}