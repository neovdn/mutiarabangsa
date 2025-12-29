// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Pastikan env variable terbaca
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Pakai Service Role agar bisa baca semua data
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

    // --- FIX HISTORY ---
    // Gemini mewajibkan history dimulai dengan 'user'. 
    // Kita hapus pesan pertama jika itu dari 'model' (sapaan awal bot).
    let cleanHistory = history || [];
    if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
      cleanHistory = cleanHistory.slice(1);
    }

    // 2. Ambil Data Produk (+ image_url dan id)
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        image_url, 
        categories (name),
        product_variants (size, price, stock)
      `);

    if (error) {
        console.error("Supabase Error:", error);
        throw new Error(`Database Error: ${error.message}`);
    }

    // 3. Format Data Context untuk AI
    const productContext = products?.map((p: any) => {
      const category = Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name;
      
      // Hitung harga terendah untuk display "Mulai Rp..."
      const minPrice = p.product_variants?.length > 0 
        ? Math.min(...p.product_variants.map((v: any) => v.price))
        : 0;
      
      const variantsInfo = p.product_variants?.map((v: any) => 
         `${v.size} (Rp${v.price.toLocaleString('id-ID')}, Stok: ${v.stock})`
      ).join(", ");

      // Kita berikan 'Raw Data' yang lengkap ke AI
      return `
ID: ${p.id}
Nama: ${p.name}
Kategori: ${category || "Umum"}
Harga_Mulai: ${minPrice}
Gambar: ${p.image_url || ""}
Deskripsi: ${p.description || "-"}
Varian: ${variantsInfo}
`;
    }).join("\n---\n");

    // 4. System Instruction (Prompt Engineering)
    const systemInstruction = `
      Kamu adalah "Mono", asisten AI ramah untuk toko "Mutiara Bangsa" (Toko Seragam & Perlengkapan Sekolah).
      
      TUGAS UTAMA:
      1. Menjawab pertanyaan pelanggan tentang ketersediaan stok, harga, dan ukuran.
      2. MEMBERIKAN KARTU PRODUK jika merekomendasikan atau menyebutkan produk spesifik.
      
      ATURAN FORMAT KARTU PRODUK:
      Setiap kali kamu menyebutkan produk yang tersedia, WAJIB sertakan kode khusus ini di baris baru:
      [[PRODUCT|ID_PRODUK|NAMA_PRODUK|HARGA_MULAI|URL_GAMBAR]]
      
      Contoh Jawaban Benar:
      "Kami punya Seragam SD Merah Putih yang bahannya adem, Kak.
      [[PRODUCT|123-abc-456|Seragam SD Merah Putih|50000|https://contoh.com/img.jpg]]
      Ada ukuran L dan XL lho."

      ATURAN LAIN:
      - Jika stok produk habis (0), katakan stok kosong.
      - Jangan mengarang data produk.
      - Jawablah dengan bahasa Indonesia yang santai, sopan, dan membantu.
      - Jika URL gambar kosong, biarkan bagian URL di kode produk kosong atau isi "undefined".
      - Jangan pernah mengarang data produk yang tidak ada di daftar.
      - Jika pertanyaannya di luar konteks produk, jawab dengan sopan bahwa kamu hanya bisa membantu soal produk toko.

      DATA PRODUK TOKO (Real-time):
      ${productContext || "Belum ada data produk."}
    `;

    // 5. Eksekusi Gemini
    // Menggunakan model stabil 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({
      history: cleanHistory,
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