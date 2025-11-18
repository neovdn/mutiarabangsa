'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createOrderFromCart, CheckoutFormState } from '../checkout/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { AlertCircle } from 'lucide-react';

// Tipe data yang diterima dari server
type CartItemWithDetails = {
  id: string;
  quantity: number;
  product_variants: {
    id: string;
    size: string;
    price: number;
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

// Tombol Submit terpisah untuk mengakses hook useFormStatus
function CheckoutButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" disabled={pending || disabled}>
      {pending ? 'Memproses...' : 'Checkout Sekarang'}
    </Button>
  );
}

// Komponen Utama
interface CartClientProps {
  cartItems: CartItemWithDetails[];
}

export function CartClient({ cartItems }: CartClientProps) {
  const router = useRouter();
  const initialState: CheckoutFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(createOrderFromCart, initialState);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product_variants?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  // Jika action gagal, tampilkan pesan error
  return (
    <form action={formAction}>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={2}>Produk</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => {
                const variant = item.product_variants;
                const product = variant?.products;
                const price = variant?.price || 0;
                const total = price * item.quantity;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="w-20">
                      <Image
                        src={product?.image_url || '/img/placeholder.png'}
                        alt={product?.name || 'Produk'}
                        width={64}
                        height={64}
                        className="rounded-md object-cover w-16 h-16"
                      />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{product?.name}</p>
                      <Badge variant="outline">Size: {variant?.size}</Badge>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(price)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(subtotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col items-end p-6 gap-4">
          
          {/* Tampilkan Error di sini */}
          {!state.success && state.message && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Checkout Gagal</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <CheckoutButton disabled={cartItems.length === 0} />
        </CardFooter>
      </Card>
    </form>
  );
}