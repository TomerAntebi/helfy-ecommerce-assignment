// ─── Domain types (mirror backend/src/types/index.ts exactly) ────────────────

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer';

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_full_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  payment_method: PaymentMethod;
  payment_last_four: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: number;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

// ─── API envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  limit?: number;
}

export interface ProductsResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartResult {
  items: CartItemWithProduct[];
  total: number;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const CHECKOUT_STEP = {
  SHIPPING:     1,
  PAYMENT:      2,
  REVIEW:       3,
  CONFIRMATION: 4,
} as const;

export type CheckoutStep = typeof CHECKOUT_STEP[keyof typeof CHECKOUT_STEP];

export interface ShippingFormData {
  full_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface PaymentFormData {
  method: PaymentMethod;
  last_four?: string;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
  shippingData: ShippingFormData | null;
  paymentData: PaymentFormData | null;
  confirmedOrderId: number | null;
}

// ─── Create order request ─────────────────────────────────────────────────────

export interface CreateOrderPayload {
  shipping_full_name: string;
  shipping_street: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  payment_method: PaymentMethod;
  payment_last_four?: string;
}
