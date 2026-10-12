// types/index.ts

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface ShippingAddress {
  address_id: number;
  user_id: number;
  country: string;
  city: string;
  zip_code: string;
  street_address: string;
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
  is_active: boolean;
  created_at: string;
  // Joined or augmented fields
  category_name?: string;
  brand_name?: string;
  image_url?: string;
  images?: ProductImage[];
  specs?: ProductSpec[];
  rating?: number;
  num_reviews?: number;
}

export interface CartItem {
  product_id: number;
  name: string;
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
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  order_id: number;
  user_id: number;
  address_id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_method?: string | null;
  created_at: string;
  items?: OrderItem[];
}
