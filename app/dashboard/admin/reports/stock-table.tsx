'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StockTableProps {
  variants: any[];
}

export function StockTable({ variants }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVariants = useMemo(() => {
    return variants.filter((variant) => {
      const productName = variant.products?.name?.toLowerCase() || '';
      const size = variant.size?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return productName.includes(search) || size.includes(search);
    });
  }, [variants, searchTerm]);

  // Sort: stok rendah dulu
  const sortedVariants = useMemo(() => {
    return [...filteredVariants].sort((a, b) => a.stock - b.stock);
  }, [filteredVariants]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari produk atau ukuran..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="font-semibold text-gray-600">Produk</TableHead>
                <TableHead className="font-semibold text-gray-600">Ukuran</TableHead>
                <TableHead className="font-semibold text-gray-600">Kategori</TableHead>
                <TableHead className="font-semibold text-gray-600 text-right">Stok</TableHead>
                <TableHead className="font-semibold text-gray-600 text-right">Harga</TableHead>
                <TableHead className="font-semibold text-gray-600 text-right">Nilai Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVariants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-gray-300" />
                      <p>Tidak ada data stok</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedVariants.map((variant) => {
                  const isLowStock = variant.stock > 0 && variant.stock < 10;
                  const isOutOfStock = variant.stock === 0;
                  const totalValue = variant.stock * variant.price;

                  return (
                    <TableRow 
                      key={variant.id}
                      className={`${
                        isOutOfStock ? 'bg-red-50/50' :
                        isLowStock ? 'bg-amber-50/30' :
                        'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <TableCell className="font-medium text-sm">
                        {variant.products?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {variant.size}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {variant.products?.categories?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-bold ${
                            isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {variant.stock}
                          </span>
                          {isOutOfStock && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
                              Habis
                            </Badge>
                          )}
                          {isLowStock && (
                            <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-500 hover:bg-amber-600">
                              Low
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-gray-700">
                        {formatCurrency(variant.price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-cyan-700">
                        {formatCurrency(totalValue)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm pt-2 border-t">
        <span className="text-gray-500">
          Total: <strong className="text-gray-900">{sortedVariants.length}</strong> varian
        </span>
        <span className="font-semibold text-gray-900">
          Total Nilai Stok: <span className="text-cyan-700">{formatCurrency(
            sortedVariants.reduce((sum, v) => sum + (v.stock * v.price), 0)
          )}</span>
        </span>
      </div>
    </div>
  );
}