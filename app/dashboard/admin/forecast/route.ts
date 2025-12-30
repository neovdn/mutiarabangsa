import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  // 1. Validasi Session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 2. Ambil Data Penjualan (12 Bulan Terakhir)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: orders, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        variant_id,
        variant:product_variants!inner (
            id,
            size,
            stock,
            product:products!inner (
                name,
                category:categories (name)
            )
        ),
        order:orders!inner (
            created_at,
            status
        )
      `)
      .gte('order.created_at', oneYearAgo.toISOString())
      .in('order.status', ['shipped', 'completed']);

    if (error) throw error;

    // 3. Agregasi Data by Variant ID
    // Kita gunakan Map untuk memastikan unique berdasarkan Variant ID
    const summaryMap = new Map();

    orders?.forEach((item: any) => {
        const variantId = item.variant_id; // Menggunakan ID dari skema
        
        if (!summaryMap.has(variantId)) {
            summaryMap.set(variantId, {
                id: variantId,
                name: `${item.variant.product.name} (${item.variant.size})`,
                category: item.variant.product.category?.name || 'Uncategorized',
                currentStock: item.variant.stock,
                history: {}
            });
        }

        const entry = summaryMap.get(variantId);
        const monthKey = new Date(item.order.created_at).toISOString().slice(0, 7); // YYYY-MM
        
        if (!entry.history[monthKey]) {
            entry.history[monthKey] = 0;
        }
        entry.history[monthKey] += item.quantity;
    });

    // Konversi Map ke Array untuk dikirim ke Gemini
    const inventoryData = Array.from(summaryMap.values());

    // 4. Prompt Engineering dengan ID
    const prompt = `
      Anda adalah AI Inventory Analyst untuk "Mutiara Bangsa".
      
      KONTEKS:
      - Tanggal Hari Ini: ${new Date().toLocaleDateString('id-ID')}
      
      DATA INVENTORY (JSON):
      ${JSON.stringify(inventoryData)}

      TUGAS:
      Analisis data history penjualan dan stok saat ini. Berikan rekomendasi restock untuk bulan depan.
      PENTING: Kembalikan field "id" persis seperti data input agar sistem bisa menyimpannya.

      OUTPUT FORMAT (JSON Array):
      [
        {
          "id": "uuid-dari-data-input",
          "productName": "Nama Produk",
          "currentStock": 10,
          "predictedDemandNextMonth": "High/Medium/Low",
          "recommendedRestock": 15,
          "reason": "Alasan singkat (Bahasa Indonesia)"
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite", 
        generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const recommendations = JSON.parse(result.response.text());

    return NextResponse.json({ recommendations });

  } catch (error: any) {
    console.error('Forecast Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}