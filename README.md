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
* Akun Supabase, Minta sambungkan ke project supabasenya atau minta file .env

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
```
mutiarabangsa
├─ .eslintrc.json
├─ app
│  ├─ dashboard
│  │  ├─ admin
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ products
│  │  │  │  ├─ actions.ts
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ product-card.tsx
│  │  │  │  ├─ product-client.tsx
│  │  │  │  ├─ product-form.tsx
│  │  │  │  ├─ product-grid.tsx
│  │  │  │  └─ product-table.tsx
│  │  │  ├─ reports
│  │  │  │  └─ page.tsx
│  │  │  ├─ stock
│  │  │  │  ├─ actions.ts
│  │  │  │  ├─ adjust-stock-dialog.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ stock-client.tsx
│  │  │  │  ├─ stock-table.tsx
│  │  │  │  └─ variant-form-dialog.tsx
│  │  │  └─ transactions
│  │  │     ├─ actions.ts
│  │  │     ├─ page.tsx
│  │  │     ├─ transaction-client.tsx
│  │  │     ├─ transaction-detail-dialog.tsx
│  │  │     └─ transaction-table.tsx
│  │  └─ customer
│  │     ├─ cart
│  │     │  ├─ actions.ts
│  │     │  ├─ cart-client.tsx
│  │     │  └─ page.tsx
│  │     ├─ catalog
│  │     │  ├─ add-to-cart-dialog.tsx
│  │     │  ├─ catalog-client.tsx
│  │     │  ├─ catalog-grid.tsx
│  │     │  ├─ page.tsx
│  │     │  └─ product-card.tsx
│  │     ├─ checkout
│  │     │  ├─ actions.ts
│  │     │  └─ success
│  │     │     └─ page.tsx
│  │     ├─ history
│  │     │  ├─ actions.ts
│  │     │  ├─ history-client.tsx
│  │     │  ├─ page.tsx
│  │     │  └─ transaction-detail-dialog.tsx
│  │     ├─ layout.tsx
│  │     ├─ orders
│  │     │  └─ [id]
│  │     │     └─ payment
│  │     │        ├─ actions.ts
│  │     │        ├─ page.tsx
│  │     │        └─ payment-client.tsx
│  │     └─ page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ login
│  │  ├─ login-client.tsx
│  │  └─ page.tsx
│  ├─ middleware.ts
│  ├─ page.tsx
│  └─ register
│     └─ page.tsx
├─ components
│  ├─ AdminNavbar.tsx
│  ├─ CustomerNavbar.tsx
│  ├─ SearchBar.tsx
│  ├─ Sidebar.tsx
│  └─ ui
│     ├─ accordion.tsx
│     ├─ alert-dialog.tsx
│     ├─ alert.tsx
│     ├─ aspect-ratio.tsx
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ breadcrumb.tsx
│     ├─ button.tsx
│     ├─ calendar.tsx
│     ├─ card.tsx
│     ├─ carousel.tsx
│     ├─ chart.tsx
│     ├─ checkbox.tsx
│     ├─ collapsible.tsx
│     ├─ command.tsx
│     ├─ context-menu.tsx
│     ├─ dialog.tsx
│     ├─ drawer.tsx
│     ├─ dropdown-menu.tsx
│     ├─ form.tsx
│     ├─ hover-card.tsx
│     ├─ input-otp.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ menubar.tsx
│     ├─ navigation-menu.tsx
│     ├─ pagination.tsx
│     ├─ popover.tsx
│     ├─ progress.tsx
│     ├─ radio-group.tsx
│     ├─ resizable.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ separator.tsx
│     ├─ sheet.tsx
│     ├─ skeleton.tsx
│     ├─ slider.tsx
│     ├─ sonner.tsx
│     ├─ switch.tsx
│     ├─ table.tsx
│     ├─ tabs.tsx
│     ├─ textarea.tsx
│     ├─ toast.tsx
│     ├─ toaster.tsx
│     ├─ toggle-group.tsx
│     ├─ toggle.tsx
│     └─ tooltip.tsx
├─ components.json
├─ hooks
│  └─ use-toast.ts
├─ lib
│  ├─ supabaseClient.ts
│  ├─ supabaseMiddlewareClient.ts
│  ├─ supabaseServerClient.ts
│  └─ utils.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  └─ img
│     ├─ bglogin.png
│     ├─ MUTIARABANGSA.png
│     └─ mutirabangsalands.png
├─ README.md
├─ supabase
│  └─ migrations
├─ tailwind.config.ts
├─ tsconfig.json
├─ types
│  ├─ order.ts
│  ├─ payment.ts
│  ├─ product.ts
│  └─ user.ts
└─ utils
   └─ constants.ts

```