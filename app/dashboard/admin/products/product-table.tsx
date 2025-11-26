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
import { MoreHorizontal, Edit, Warehouse, Trash2 } from 'lucide-react';
import { ProductWithDetails } from '@/types/product';

interface ProductTableProps {
  products: ProductWithDetails[];
  onEdit: (product: ProductWithDetails) => void;
  onManageVariants: (product: ProductWithDetails) => void;
  onDelete: (product: ProductWithDetails) => void;
}

export function ProductTable({
  products,
  onEdit,
  onManageVariants,
  onDelete,
}: ProductTableProps) {
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
    const needsRestock = variants.some((v) => v.stock < 10);

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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px] font-semibold text-gray-600">Gambar</TableHead>
            <TableHead className="font-semibold text-gray-600">Nama Produk</TableHead>
            <TableHead className="font-semibold text-gray-600">Kategori</TableHead>
            <TableHead className="font-semibold text-gray-600">Harga</TableHead>
            <TableHead className="font-semibold text-gray-600">Total Stok</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-16">
                <div className="flex flex-col items-center gap-2">
                   <span className="text-2xl">🔍</span>
                   <p>Tidak ada produk yang cocok.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const stockInfo = getStockInfo(product.product_variants);
              return (
                <TableRow key={product.id} className="hover:bg-blue-50/30 transition-colors border-gray-100">
                  <TableCell className="py-3">
                    <div className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                        <Image
                        src={product.image_url || '/img/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                  <TableCell>
                    {product.categories ? (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 font-normal">
                        {product.categories.name}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Tanpa Kategori</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-700">{stockInfo.range}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{stockInfo.total}</span>
                        {stockInfo.needsRestock && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                            Low
                        </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4 text-gray-500" /> Edit Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onManageVariants(product)} className="cursor-pointer">
                          <Warehouse className="mr-2 h-4 w-4 text-gray-500" /> Kelola Stok
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus Produk
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