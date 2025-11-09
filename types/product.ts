import { Profile } from './user';

// Berdasarkan tabel public.categories
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Berdasarkan tabel public.product_variants
export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  price: number;
  stock: number;
  sku: string | null;
  created_at: string;
}

// Berdasarkan tabel public.products
export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
}

// Tipe gabungan untuk mempermudah passing data
export type ProductWithDetails = Product & {
  categories: Category | null;
  product_variants: ProductVariant[];
};