import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Format Currency Helper
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

interface ReportData {
  salesData: any;
  topProducts: any[];
  stockData: any;
  topCategories: any[];
  startDate: Date;
  endDate: Date;
}

// --- GENERATOR EXCEL ---
export const generateExcel = ({
  salesData,
  topProducts,
  stockData,
  topCategories,
  startDate,
  endDate,
}: ReportData) => {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Ringkasan (Summary)
  const summaryData = [
    ['Laporan', 'Ringkasan Performa Toko Mutiara Bangsa'],
    ['Periode', `${format(startDate, 'dd MMM yyyy', { locale: id })} - ${format(endDate, 'dd MMM yyyy', { locale: id })}`],
    ['Tanggal Cetak', format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })],
    [],
    ['Metrik', 'Nilai'],
    ['Total Pendapatan', salesData.totalRevenue],
    ['Total Pesanan Berhasil', salesData.totalOrders],
    ['Rata-rata Nilai Order', salesData.avgOrderValue],
    ['Total Nilai Aset Stok', stockData.totalValue],
    ['Jumlah Produk Low Stock', stockData.lowStockCount],
    ['Jumlah Produk Habis', stockData.outOfStockCount],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // 2. Sheet Detail Penjualan Harian
  const salesRows = salesData.dailySales.map((sale: any) => ({
    Tanggal: format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
    Status: sale.status,
    'Total Belanja': sale.total_amount,
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesRows);
  XLSX.utils.book_append_sheet(wb, wsSales, 'Data Penjualan');

  // 3. Sheet Stok Barang (Inventory)
  const stockRows = stockData.variants.map((variant: any) => ({
    'Nama Produk': variant.products?.name,
    'Ukuran': variant.size,
    'Kategori': variant.products?.categories?.name || '-',
    'Stok Saat Ini': variant.stock,
    'Status Stok': variant.stock === 0 ? 'Habis' : variant.stock < 10 ? 'Menipis' : 'Aman',
    'Harga Satuan': variant.price,
    'Total Nilai Aset': variant.stock * variant.price,
  }));
  const wsStock = XLSX.utils.json_to_sheet(stockRows);
  XLSX.utils.book_append_sheet(wb, wsStock, 'Laporan Stok');

  // 4. Sheet Produk Terlaris
  const topProductRows = topProducts.map((prod: any, index: number) => ({
    Peringkat: index + 1,
    'Nama Produk': prod.name,
    'Jumlah Terjual': prod.totalQuantity,
    'Total Pendapatan': prod.totalRevenue,
  }));
  const wsTopProd = XLSX.utils.json_to_sheet(topProductRows);
  XLSX.utils.book_append_sheet(wb, wsTopProd, 'Produk Terlaris');

  // Download File
  const fileName = `Laporan_MutiaraBangsa_${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// --- GENERATOR PDF ---
export const generatePDF = ({
  salesData,
  topProducts,
  stockData,
  topCategories,
  startDate,
  endDate,
}: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- Header ---
  doc.setFontSize(18);
  doc.text('Mutiara Bangsa - Laporan Toko', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Pusat Seragam & Perlengkapan Sekolah', 14, 26);
  doc.text(`Periode Laporan: ${format(startDate, 'dd MMMM yyyy', { locale: id })} s/d ${format(endDate, 'dd MMMM yyyy', { locale: id })}`, 14, 32);
  
  doc.setLineWidth(0.5);
  doc.line(14, 36, pageWidth - 14, 36);

  // --- Section 1: Ringkasan Eksekutif ---
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Ringkasan Eksekutif', 14, 46);

  const summaryBody = [
    ['Total Pendapatan', formatRupiah(salesData.totalRevenue), 'Total Nilai Stok', formatRupiah(stockData.totalValue)],
    ['Total Transaksi', salesData.totalOrders.toString(), 'Stok Menipis (<10)', stockData.lowStockCount.toString()],
    ['Rata-rata Order', formatRupiah(salesData.avgOrderValue), 'Stok Habis', stockData.outOfStockCount.toString()],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metrik Penjualan', 'Nilai', 'Metrik Inventaris', 'Nilai']],
    body: summaryBody,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Warna biru Mutiara Bangsa
    styles: { fontSize: 10, cellPadding: 3 },
  });

  // --- Section 2: Produk Terlaris (Top 5) ---
  const finalYAfterSummary = (doc as any).lastAutoTable.finalY || 50;
  
  doc.setFontSize(14);
  doc.text('5 Produk Terlaris', 14, finalYAfterSummary + 15);

  const topProductRows = topProducts.map((p, index) => [
    index + 1,
    p.name,
    `${p.totalQuantity} pcs`,
    formatRupiah(p.totalRevenue)
  ]);

  autoTable(doc, {
    startY: finalYAfterSummary + 20,
    head: [['No', 'Nama Produk', 'Terjual', 'Pendapatan']],
    body: topProductRows,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] },
  });

  // --- Section 3: Data Stok Bermasalah (Habis/Sedikit) ---
  const finalYAfterProducts = (doc as any).lastAutoTable.finalY;
  
  // Filter stok yang perlu perhatian (habis atau low)
  const alertStock = stockData.variants
    .filter((v: any) => v.stock < 10)
    .sort((a: any, b: any) => a.stock - b.stock) // Urutkan dari yang paling kritis (0)
    .slice(0, 15); // Ambil 15 teratas agar muat di PDF

  if (alertStock.length > 0) {
    doc.addPage(); // Pindah halaman baru untuk tabel stok agar rapi
    doc.setFontSize(14);
    doc.text('Peringatan Stok (Perlu Restock)', 14, 20);

    const stockRows = alertStock.map((v: any) => [
      v.products?.name,
      v.size,
      v.stock === 0 ? 'HABIS' : v.stock,
      formatRupiah(v.price)
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Produk', 'Ukuran', 'Sisa Stok', 'Harga Jual']],
      body: stockRows,
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] }, // Merah untuk alert
    });
  }

  // Footer Page Number
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Halaman ${i} dari ${pageCount} | Dicetak oleh Sistem Admin Mutiara Bangsa`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  }

  // Save PDF
  const fileName = `Laporan_MutiaraBangsa_${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};