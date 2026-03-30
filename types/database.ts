// ─── Types de base (existants) ────────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_fr: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_merchant: boolean;
  business_type: 'individual' | 'company' | null;  // ← nouveau
  city_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  city_id: string | null;
  address: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  cover_url: string | null;
  has_delivery: boolean;
  accepts_wave: boolean;
  accepts_orange_money: boolean;
  accepts_mtn_money: boolean;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  click_count: number;
  is_verified: boolean;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  city?: City;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  is_featured: boolean;
  is_available: boolean;
  created_at: string;
  // Relations
  shop?: Shop;
}

// ─── Review (étendu) ──────────────────────────────────────────────────────────

export interface Review {
  id: string;
  shop_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  photos: string[];                   // ← nouveau
  helpful_count: number;              // ← nouveau
  merchant_reply: string | null;      // ← nouveau
  merchant_reply_at: string | null;   // ← nouveau
  created_at: string;
  // Relations
  user_profile?: UserProfile;
}

export interface Favorite {
  id: string;
  user_id: string;
  shop_id: string;
  created_at: string;
  shop?: Shop;
}

export interface Promotion {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  discount_percent: number | null;
  image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ShopHours {
  id: string;
  shop_id: string;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

// ─── Panier ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  shop_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Relations
  product?: Product;
  shop?: Shop;
}

/** Version enrichie utilisée dans le contexte panier */
export interface CartItemWithProduct extends CartItem {
  product: Product;
  shop: Shop;
}

// ─── Commandes ────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'wave' | 'orange_money' | 'mtn_money' | 'cash';

export interface Order {
  id: string;
  user_id: string | null;
  shop_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string | null;
  delivery_fee: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  shop?: Shop;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;           // colonne générée
  // Relations
  product?: Product;
}

// ─── Campagnes ────────────────────────────────────────────────────────────────

export type CampaignPlanName = 'basic' | 'premium' | 'boost';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface CampaignPlan {
  id: string;
  name: CampaignPlanName;
  label_fr: string;
  price_fcfa: number;
  duration_days: number;
  features: string[];
  highlight: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  shop_id: string;
  plan_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_city_id: string | null;
  target_category_id: string | null;
  budget_fcfa: number | null;
  impressions: number;
  clicks: number;
  status: CampaignStatus;
  starts_at: string;
  ends_at: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  // Relations
  plan?: CampaignPlan;
  shop?: Shop;
}

// ─── Stats commerçant ────────────────────────────────────────────────────────

export interface MerchantStats {
  views: number;
  clicks: number;
  reviewCount: number;
  ratingAvg: number;
  ordersTotal: number;
  ordersRevenue: number;
  campaignImpressions: number;
  weeklyViews: number[];   // 7 derniers jours
  weeklyOrders: number[];  // 7 derniers jours
}
