import { createSupabaseServerClient } from '@/lib/supabaseServerClient'; // Gunakan ini
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: Request) {
  // Ganti inisialisasi client
  const supabase = createSupabaseServerClient();

  // 1. Validasi Admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 2. Ambil Data Penjualan Historis (12 Bulan Terakhir)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: orders, error: orderError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        created_at,
        variant:product_variants (
            id,
            size,
            stock,
            product:products (
                name,
                category:categories (name)
            )
        ),
        order:orders!inner (status)
      `)
      .gte('created_at', oneYearAgo.toISOString())
      .in('order.status', ['shipped', 'completed']); // Filter order sukses

    if (orderError) throw orderError;

    // 3. Agregasi Data
    const summary: Record<string, any> = {};

    orders?.forEach((item: any) => {
        // Pastikan varian dan produk ada (handle case null/terhapus)
        if (!item.variant || !item.variant.product) return;

        const productName = `${item.variant.product.name} (${item.variant.size})`;
        const monthKey = new Date(item.created_at).toISOString().slice(0, 7); // YYYY-MM

        if (!summary[productName]) {
            summary[productName] = {
                history: {},
                currentStock: item.variant.stock,
                category: item.variant.product.category?.name
            };
        }

        if (!summary[productName].history[monthKey]) {
            summary[productName].history[monthKey] = 0;
        }
        summary[productName].history[monthKey] += item.quantity;
    });

    // 4. Prompt Engineering untuk Gemini (Konteks Indonesia)
    const prompt = `
      Anda adalah AI Inventory Analyst untuk "Mutiara Bangsa", toko seragam sekolah di Indonesia.
      
      KONTEKS SAA INI:
      - Tanggal: ${new Date().toLocaleDateString('id-ID')}
      - Musim:
        * Jun-Jul: Tahun Ajaran Baru (Permintaan Tinggi)
        * Jan: Semester 2 (Permintaan Sedang)
        * Aug: 17 Agustus/Pramuka

      TUGAS:
      Analisis data penjualan berikut dan berikan rekomendasi restock.
      
      DATA (JSON):
      ${JSON.stringify(summary)}

      OUTPUT JSON (Array):
      [
        {
          "productName": "Nama Produk",
          "currentStock": 0,
          "predictedDemandNextMonth": "High/Medium/Low",
          "recommendedRestock": 0,
          "reason": "Alasan singkat (Bahasa Indonesia)"
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite", 
        generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const recommendations = JSON.parse(responseText);

    return NextResponse.json({ recommendations });

  } catch (error: any) {
    console.error('Forecast Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}