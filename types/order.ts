import { ProductVariant } from './product';

// Tipe untuk tabel order_items (schema: price_at_purchase adalah integer)
export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number; // Sesuai skema (integer)
  created_at: string;
  // Opsional: Untuk join data
  product_variants?: ProductVariant;
}

// Tipe untuk tabel orders (schema: total_amount adalah integer)
export interface Order {
  id: string;
  user_id: string;
  total_amount: number; // Sesuai skema (integer)
  status: string; // 'pending_payment', 'Diproses', 'Dikirim', 'Selesai', 'Batal'
  created_at: string;
  updated_at: string;
  // Relasi (jika di-join)
  order_items?: OrderItem[];
  
  // Kolom alamat (opsional untuk diisi)
  shipping_address_street?: string | null;
  shipping_address_city?: string | null;
  shipping_address_province?: string | null;
  shipping_address_postal_code?: string | null;
  shipping_service?: string | null;
  shipping_receipt_number?: string | null;
}