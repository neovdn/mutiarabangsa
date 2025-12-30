"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

interface Recommendation {
  id: string; 
  productName: string;
  currentStock: number;
  predictedDemandNextMonth: "High" | "Medium" | "Low";
  recommendedRestock: number;
  reason: string;
  isSaved?: boolean;
}

export default function ForecastTab() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const { toast } = useToast();

  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/dashboard/admin/forecast", { method: "POST" });
      if (!res.ok) throw new Error("Gagal mengambil prediksi AI");

      const data = await res.json();
      setRecommendations(data.recommendations);
      
      toast({
        title: "Analisis AI Selesai",
        description: "Rekomendasi stok baru telah dibuat berdasarkan data historis.",
        className: "bg-indigo-50 border-indigo-200 text-indigo-700"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Terjadi kesalahan saat melakukan forecasting.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecommendation = async (item: Recommendation, index: number) => {
    // Double check untuk mencegah save 0 item
    if (item.recommendedRestock <= 0) return;

    try {
      const nextMonth = addMonths(new Date(), 1);
      const startDate = startOfMonth(nextMonth);
      const endDate = endOfMonth(nextMonth);

      const res = await fetch("/dashboard/admin/forecast/save", {
        method: "POST",
        body: JSON.stringify({
          variantId: item.id,
          quantity: item.recommendedRestock,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!res.ok) throw new Error("Gagal menyimpan rekomendasi");

      const updatedRecs = [...recommendations];
      updatedRecs[index].isSaved = true;
      setRecommendations(updatedRecs);

      toast({
        title: "Berhasil Disimpan",
        description: `Rekomendasi restock untuk ${item.productName} telah disimpan ke database.`,
        className: "bg-green-50 border-green-200 text-green-700"
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Tidak dapat menyimpan data ke database.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/90 backdrop-blur-sm border-indigo-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                AI Inventory Forecast
              </CardTitle>
              <CardDescription className="text-indigo-700/80">
                Analisis cerdas menggunakan AI untuk memprediksi kebutuhan stok bulan depan.
              </CardDescription>
            </div>
            <Button 
                onClick={handleGenerateForecast} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Forecast
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recommendations.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
              <TrendingUp className="h-12 w-12 mb-4 text-slate-300" />
              <h3 className="font-semibold text-lg text-slate-700">Belum ada data prediksi</h3>
              <p className="text-sm max-w-sm mx-auto mt-2 text-slate-500">
                Klik tombol "Generate Forecast" di atas untuk meminta AI menganalisis tren penjualan historis dan memberikan saran restock.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-100 overflow-hidden">
                <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-center">Stok Saat Ini</TableHead>
                    <TableHead className="text-center">Prediksi</TableHead>
                    <TableHead className="text-center">Saran Restock</TableHead>
                    <TableHead>Analisis AI</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-50" />
                        </TableRow>
                        ))
                    : recommendations.map((item, idx) => (
                        <TableRow key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-medium text-slate-800">{item.productName}</TableCell>
                            <TableCell className="text-center">
                                <span className={item.currentStock < 10 ? "text-red-600 font-bold" : "text-slate-600"}>
                                    {item.currentStock}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                            <Badge
                                className={
                                item.predictedDemandNextMonth === "High"
                                    ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                                    : item.predictedDemandNextMonth === "Medium"
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                }
                                variant="outline"
                            >
                                {item.predictedDemandNextMonth}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                {item.recommendedRestock > 0 ? (
                                    <span className="font-bold text-emerald-600">+{item.recommendedRestock}</span>
                                ) : (
                                    <span className="text-gray-400 font-medium">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 max-w-md leading-relaxed">
                            {item.reason}
                            </TableCell>
                            <TableCell className="text-right">
                              {/* LOGIKA PERUBAHAN DISINI */}
                              {item.recommendedRestock > 0 ? (
                                // Jika ada saran restock (> 0)
                                item.isSaved ? (
                                  <Button size="sm" variant="ghost" disabled className="text-green-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Tersimpan
                                  </Button>
                                ) : (
                                  <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                                      onClick={() => handleSaveRecommendation(item, idx)}
                                  >
                                      <Save className="h-3.5 w-3.5 mr-1.5" />
                                      Simpan
                                  </Button>
                                )
                              ) : (
                                // Jika saran restock 0 (Stok Aman)
                                <div className="flex items-center justify-end text-slate-400 text-sm font-medium py-1 px-3">
                                    <Check className="h-4 w-4 mr-1 text-green-500" />
                                    Stok Aman
                                </div>
                              )}
                            </TableCell>
                        </TableRow>
                        ))}
                </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
            <CardContent className="pt-6 flex gap-4">
                <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-blue-900 text-sm mb-1">Info Sistem</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Item dengan status "Stok Aman" tidak perlu dilakukan restock karena stok saat ini diprediksi cukup untuk memenuhi permintaan bulan depan.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}