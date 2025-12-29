// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Pastikan env variable terbaca
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    // 1. Validasi Environment Variables
    if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
      console.error("Missing Environment Variables");
      return NextResponse.json({ error: "Konfigurasi server belum lengkap." }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    const { message, history } = await req.json();

    // --- FIX UTAMA DISINI ---
    // Gemini mewajibkan history dimulai dengan 'user'. 
    // Kita hapus pesan pertama jika itu dari 'model' (sapaan awal bot).
    let cleanHistory = history || [];
    if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
      cleanHistory = cleanHistory.slice(1);
    }
    // ------------------------

    // 2. Ambil Data Produk
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        categories (name),
        product_variants (size, price, stock)
      `);

    if (error) {
      console.error("Supabase Error:", error.message);
      throw new Error(`Gagal mengambil data produk: ${error.message}`);
    }

    // 3. Format Data Context
    const productContext = products?.map((p: any) => {
      const categoryName = Array.isArray(p.categories) 
        ? p.categories[0]?.name 
        : p.categories?.name;

      const variantsInfo = p.product_variants && p.product_variants.length > 0
        ? p.product_variants.map((v: any) => 
            `- Ukuran: ${v.size}, Harga: Rp${v.price.toLocaleString('id-ID')}, Stok: ${v.stock}`
          ).join("\n")
        : "- Belum ada varian/stok";
      
      return `
[PRODUK]
Nama: ${p.name}
Kategori: ${categoryName || "Umum"}
Deskripsi: ${p.description || "-"}
Varian & Stok:
${variantsInfo}
`;
    }).join("\n\n");

    // 4. Prompt System
    const systemInstruction = `
      Kamu adalah "Mono", asisten AI ramah untuk toko "Mutiara Bangsa" (Toko Seragam & Perlengkapan Sekolah).
      
      TUGAS KAMU:
      1. Menjawab pertanyaan pelanggan tentang ketersediaan stok, harga, dan ukuran berdasarkan DATA PRODUK di bawah.
      2. Jika stok produk habis (0), katakan dengan jujur bahwa stok sedang kosong.
      3. Jangan pernah mengarang data produk yang tidak ada di daftar.
      4. Jawablah dengan bahasa Indonesia yang santai, sopan, dan membantu.
      5. Jika ditanya harga, formatlah menjadi Rupiah (contoh: Rp 50.000).

      DATA PRODUK TOKO (Update Real-time):
      ${productContext || "Belum ada data produk."}
    `;

    // 5. Eksekusi Gemini dengan History yang sudah dibersihkan
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({
      history: cleanHistory, // Gunakan history yang sudah divalidasi
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ 
      error: "Maaf, Mono sedang pusing. Coba lagi nanti ya!" 
    }, { status: 500 });
  }
}