import { ProductVariant, Product } from './product';

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  // Update status enum
  status: 'pending_payment' | 'waiting_confirmation' | 'processing' | 'shipped' | 'completed' | 'cancelled'; 
  created_at: string;
  updated_at: string;
  
  shipping_address_street?: string | null;
  shipping_address_city?: string | null;
  shipping_address_province?: string | null;
  shipping_address_postal_code?: string | null;
  shipping_service?: string | null;
  shipping_receipt_number?: string | null;
}

export type OrderItemWithDetails = OrderItem & {
  product_variants: {
    size: string;
    products: {
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

export interface OrderWithDetails extends Order {
  order_items: OrderItemWithDetails[];
}