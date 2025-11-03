<div align="center">
  <img src="/public/img/MUTIARABANGSA.png" alt="Mutiara Bangsa Logo" width="400"/>
</div>

<h1 align="center">Mutiara Bangsa E-Commerce</h1>

Mutiara Bangsa adalah website e-commerce untuk penjualan seragam dan perlengkapan sekolah. Proyek ini dilengkapi dengan sistem manajemen stok dan fitur **Inventory Forecast & Restock Helper** untuk membantu toko dalam memantau dan memprediksi kebutuhan *restock* secara efisien.

Aplikasi ini memiliki dua peran utama:
* **Customer:** Dapat menjelajahi katalog, menambahkan produk ke keranjang, dan melihat riwayat pesanan.
* **Admin:** Memiliki dashboard khusus untuk mengelola produk, melihat transaksi, dan mengakses laporan penjualan.

---

## 🚀 Teknologi yang Digunakan

Proyek ini dibangun menggunakan tumpukan teknologi modern yang berfokus pada performa dan pengalaman pengembang:

* **Framework:** **Next.js 13** (App Router)
* **Bahasa:** **TypeScript**
* **Backend & Database:** **Supabase** (Auth, Postgres Database)
* **Styling:** **Tailwind CSS**
* **UI Components:** **shadcn/ui** (dibuat di atas Radix UI & Lucide React)
* **Manajemen Formulir:** **React Hook Form** dengan resolver **Zod**
* **Visualisasi Data:** **Recharts** (untuk dashboard laporan)

---

## 🛠️ Panduan Instalasi dan Menjalankan

### Prasyarat

* Node.js (v18 atau lebih baru)
* npm / yarn / pnpm
* Akun Supabase

### 1. Kloning Repositori

```bash
git clone [https://github.com/username/nama-repositori.git](https://github.com/username/nama-repositori.git)
cd nama-repositori

### 2. Instalasi Dependensi

Setelah masuk ke direktori proyek, instal semua dependensi yang diperlukan menggunakan package manager pilihan Anda:

```bash
# Menggunakan npm
npm install

# Menggunakan yarn
yarn install

# Menggunakan pnpm
pnpm install

### 3. Jalankan Project

Jalankan project dengan perintah:

```bash
# Menggunakan npm
npm run dev