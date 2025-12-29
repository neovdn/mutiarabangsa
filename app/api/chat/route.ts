// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Inisialisasi Supabase (gunakan service role key atau anon key jika RLS membolehkan read public)
// Untuk keamanan server-side, lebih baik gunakan process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. Ambil Data Produk dari Database (Products + Variants + Categories)
    // Kita join table products, variants, dan categories
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        name,
        description,
        categories (name),
        product_variants (size, price, stock)
      `);

    if (error) throw error;

    // 2. Format Data menjadi Teks untuk "Konteks" AI
    // Ini teknik RAG sederhana (Retrieval Augmented Generation)
    const productContext = products?.map((p: any) => {
      const variantsInfo = p.product_variants
        .map((v: any) => `- Ukuran: ${v.size}, Harga: Rp${v.price}, Stok: ${v.stock}`)
        .join("\n");
      
      return `
      Produk: ${p.name}
      Kategori: ${p.categories?.name || "Umum"}
      Deskripsi: ${p.description || "-"}
      Varian Tersedia:
      ${variantsInfo}
      `;
    }).join("\n---\n");

    // 3. Siapkan Prompt Sistem
    const systemInstruction = `
      Kamu adalah asisten AI ramah untuk toko "Mutiara Bangsa" (Toko Seragam & Perlengkapan Sekolah).
      
      Tugasmu:
      - Menjawab pertanyaan pelanggan tentang stok, harga, dan ukuran produk.
      - Memberikan rekomendasi berdasarkan data produk di bawah ini.
      - Jawab dengan bahasa Indonesia yang sopan dan natural.
      - Jika ditanya soal hal di luar produk toko, jawab dengan sopan bahwa kamu hanya melayani pertanyaan seputar toko.
      - JANGAN mengarang stok atau harga. Gunakan data yang diberikan.

      DATA PRODUK TOKO SAAT INI:
      ${productContext}
    `;

    // 4. Kirim ke Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction, // System instruction agar AI fokus
    });

    const chat = model.startChat({
      history: history || [], // Mengirim history chat sebelumnya agar percakapan nyambung
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Maaf, terjadi kesalahan pada server." }, { status: 500 });
  }
}