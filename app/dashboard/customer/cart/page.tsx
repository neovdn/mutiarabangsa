import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';

// Definisikan tipe untuk data yang kita fetch
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

// Fungsi untuk mengambil data keranjang
async function getCartItems(): Promise<CartItemWithDetails[]> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      quantity,
      product_variants (
        id,
        size,
        price,
        products (
          id,
          name,
          image_url
        )
      )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching cart items:', error.message);
    return [];
  }

  // @ts-ignore
  return data as CartItemWithDetails[];
}

// Komponen Halaman Keranjang (Server Component)
export default async function CustomerCartPage() {
  const cartItems = await getCartItems();

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product_variants?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Keranjang Belanja</h2>
        <p className="text-gray-600">Periksa item Anda sebelum checkout</p>
      </div>

      {cartItems.length === 0 ? (
        // Tampilan Keranjang Kosong
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-cyan-100 to-magenta-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-black" />
            </div>
            <h3 className="text-2xl font-semibold text-black mb-3">
              Keranjang Anda Kosong
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Sepertinya Anda belum menambahkan produk apapun ke keranjang.
            </p>
          </div>
        </div>
      ) : (
        // Tampilan Keranjang Isi (Minimalis)
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
          <CardFooter className="flex justify-end p-6">
            <Button size="lg" disabled>
              Checkout (Segera Hadir)
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}