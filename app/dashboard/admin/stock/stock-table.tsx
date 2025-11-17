'use client';

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
import { cn } from '@/lib/utils';
import { VariantWithProduct } from './stock-client';

interface StockTableProps {
  variants: VariantWithProduct[];
  onEdit: (variant: VariantWithProduct) => void;
  onAdjustStock: (variant: VariantWithProduct) => void;
  onDelete: (variant: VariantWithProduct) => void;
}

export function StockTable({
  variants,
  onEdit,
  onAdjustStock,
  onDelete,
}: StockTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead>Varian (Ukuran)</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-gray-500 py-10"
              >
                Tidak ada stok barang yang cocok dengan filter.
              </TableCell>
            </TableRow>
          ) : (
            variants.map((variant) => {
              const needsRestock = variant.stock < 10;
              return (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">
                    {variant.products?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{variant.size}</TableCell>
                  <TableCell>
                    {variant.products?.categories ? (
                      <Badge variant="secondary">
                        {variant.products.categories.name}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(variant.price)}</TableCell>
                  <TableCell
                    className={cn(
                      'font-semibold',
                      needsRestock && 'text-destructive',
                    )}
                  >
                    {variant.stock}
                    {needsRestock && (
                      <Badge variant="destructive" className="ml-2">
                        Rendah
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{variant.sku || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi Varian</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(variant)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdjustStock(variant)}>
                          <Warehouse className="mr-2 h-4 w-4" />
                          Sesuaikan Stok
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(variant)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Varian
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