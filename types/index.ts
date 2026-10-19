// types/index.ts
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  birthday?: string | null;
  avatar_url?: string | null;
}

export interface ShippingAddress {
  address_id: number;
  user_id: number;
  recipient_name?: string;
  phone?: string | null;
  country: string;
  city: string;
  zip_code: string;
  street_address: string;
  address_details?: string | null;
  is_default: boolean;
}

export interface Category {
  category_id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  image_url?: string | null;
}

export interface Brand {
  brand_id: number;
  name: string;
  logo_url?: string | null;
}

export interface ProductImage {
  image_id: number;
  product_id: number;
  image_url: string;
  is_main: boolean;
}

export interface ProductSpec {
  spec_id: number;
  product_id: number;
  spec_key: string;
  spec_value: string;
}

export interface Product {
  product_id: number;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  discount_price?: number | null;
  stock_quantity: number;
  variant_id?: number;
  is_active: boolean;
  created_at: string;
  category_name?: string;
  brand_name?: string;
  image_url?: string;
  images?: ProductImage[];
  specs?: ProductSpec[];
  variants?: ProductVariant[];
  rating?: number;
  num_reviews?: number;
}

export interface ProductVariant {
  variant_id: number;
  product_id: number;
  sku?: string | null;
  variant_name?: string | null;
  options: Record<string, string>;
  price: number;
  discount_price?: number | null;
  currency: string;
  stock_quantity: number;
}

export interface CartItem {
  variant_id: number;
  product_id: number;
  name: string;
  variant_name?: string | null;
  slug: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  quantity: number;
}

export interface Review {
  review_id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
  user_name?: string;
  title?: string | null;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  variant_id?: number | null;
  product_name: string;
  variant_name?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  currency?: string;
}

export interface Order {
  order_id: number;
  user_id: number;
  address_id?: number | null;
  payment_method_id?: number | null;
  total_amount: number;
  currency?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'failed';
  payment_method?: string | null;
  shipping_address_snapshot?: Record<string, unknown> | null;
  created_at: string;
  items?: OrderItem[];
}

export interface SavedShippingAddress {
  recipient_name: string;
  phone: string | null;
  country: string;
  city: string;
  zip_code: string | null;
  street_address: string;
  address_details: string | null;
}

export interface SavedPaymentMethod {
  card_brand: string;
  last_four: string;
  exp_month: number;
  exp_year: number;
}

export interface SavedSettings {
  address: SavedShippingAddress | null;
  payment: SavedPaymentMethod | null;
}
