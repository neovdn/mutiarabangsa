"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Recommendation {
  productName: string;
  currentStock: number;
  predictedDemandNextMonth: "High" | "Medium" | "Low";
  recommendedRestock: number;
  reason: string;
}

export default function ForecastTab() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/forecast", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Gagal mengambil prediksi AI");

      const data = await res.json();
      setRecommendations(data.recommendations);
      toast.success("Analisis AI selesai!");
    } catch (error) {
      toast.error("Terjadi kesalahan saat melakukan forecasting");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                AI Inventory Forecast
              </CardTitle>
              <CardDescription>
                Analisis tren penjualan historis dan prediksi kebutuhan stok untuk musim sekolah mendatang.
              </CardDescription>
            </div>
            <Button onClick={handleGenerateForecast} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menganalisis Data...
                </>
              ) : (
                <>
                  Generate Forecast
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground bg-slate-50 rounded-md border border-dashed">
              <TrendingUp className="h-10 w-10 mb-3 opacity-50" />
              <p>Belum ada data prediksi.</p>
              <p className="text-sm">Klik tombol "Generate Forecast" untuk meminta AI menganalisis stok Anda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-center">Stok Saat Ini</TableHead>
                  <TableHead className="text-center">Prediksi Permintaan</TableHead>
                  <TableHead className="text-center">Saran Restock</TableHead>
                  <TableHead>Analisis AI</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? // Skeleton Loading State
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-100" />
                      </TableRow>
                    ))
                  : recommendations.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-center">
                            <span className={item.currentStock < 10 ? "text-red-600 font-bold" : ""}>
                                {item.currentStock}
                            </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              item.predictedDemandNextMonth === "High"
                                ? "destructive"
                                : item.predictedDemandNextMonth === "Medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {item.predictedDemandNextMonth}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold text-green-700">
                          +{item.recommendedRestock} pcs
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-md">
                          {item.reason}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => toast("Fitur restock otomatis akan segera hadir!")}>
                            Restock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card - Context Awareness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-100">
            <CardContent className="pt-6 flex gap-4">
                <AlertCircle className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                    <h4 className="font-semibold text-blue-900">Insight Musiman</h4>
                    <p className="text-sm text-blue-700">
                        AI menggunakan data tanggal hari ini ({new Date().toLocaleDateString('id-ID')}) untuk mendeteksi event sekolah terdekat (Ujian, Tahun Ajaran Baru, dll).
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}