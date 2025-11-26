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
import { MoreHorizontal, Edit, Warehouse, Trash2, Box } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-600">Produk</TableHead>
            <TableHead className="font-semibold text-gray-600">Ukuran</TableHead>
            <TableHead className="font-semibold text-gray-600">Kategori</TableHead>
            <TableHead className="font-semibold text-gray-600">Harga</TableHead>
            <TableHead className="font-semibold text-gray-600">Stok</TableHead>
            <TableHead className="font-semibold text-gray-600">SKU</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-gray-500 py-16"
              >
                <div className="flex flex-col items-center gap-2">
                    <Box className="h-8 w-8 text-gray-300" />
                    <p>Data stok tidak ditemukan.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            variants.map((variant) => {
              const needsRestock = variant.stock < 10;
              return (
                <TableRow key={variant.id} className="hover:bg-cyan-50/30 transition-colors border-gray-100">
                  <TableCell className="font-medium text-gray-900 py-3">
                    {variant.products?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-normal">
                       {variant.size}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {variant.products?.categories ? (
                       <span className="text-sm text-gray-600">{variant.products.categories.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-gray-700">{formatCurrency(variant.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <span className={cn("font-bold", needsRestock ? "text-red-600" : "text-green-600")}>
                           {variant.stock}
                        </span>
                        {needsRestock && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 bg-red-500 border-0">
                            Low
                        </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">{variant.sku || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl">
                        <DropdownMenuLabel>Aksi Varian</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(variant)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4 text-gray-500" /> Edit Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdjustStock(variant)} className="cursor-pointer">
                          <Warehouse className="mr-2 h-4 w-4 text-gray-500" /> Sesuaikan Stok
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                          onClick={() => onDelete(variant)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus Varian
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