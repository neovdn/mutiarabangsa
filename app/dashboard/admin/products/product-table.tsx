'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';

interface ProductTableProps {
  products: ProductWithDetails[];
  onEdit: (product: ProductWithDetails) => void;
  // onManageVariants: (product: ProductWithDetails) => void;
  // onDelete: (product: ProductWithDetails) => void;
}

export function ProductTable({
  products,
  onEdit,
}: // onManageVariants,
// onDelete,
ProductTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockInfo = (variants: ProductWithDetails['product_variants']) => {
    if (variants.length === 0) {
      return { total: 0, needsRestock: false, range: '-' };
    }

    const total = variants.reduce((sum, v) => sum + v.stock, 0);
    const needsRestock = variants.some((v) => v.stock < 10); // Sesuai use case "stok rendah"

    const prices = variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range =
      minPrice === maxPrice
        ? formatCurrency(minPrice)
        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

    return { total, needsRestock, range };
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Gambar</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Total Stok</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                Belum ada produk.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const stockInfo = getStockInfo(product.product_variants);
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image_url || '/img/placeholder.png'} // Sediakan placeholder
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-md object-cover w-12 h-12"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.categories ? (
                      <Badge variant="secondary">
                        {product.categories.name}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{stockInfo.range}</TableCell>
                  <TableCell>
                    {stockInfo.total}
                    {stockInfo.needsRestock && (
                      <Badge variant="destructive" className="ml-2">
                        Restock Needed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          Edit Produk
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            alert('Fitur "Manage Variants" belum dibuat')
                          }
                        >
                          Kelola Varian/Stok
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            alert('Fitur "Delete" belum dibuat')
                          }
                        >
                          Hapus Produk
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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