// types/product.ts

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  parent_id: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  price: number;
  stock: number;
  sku: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface ProductWithDetails {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  categories: Category | null;
  product_variants: ProductVariant[];
  reviews?: Review[];
}