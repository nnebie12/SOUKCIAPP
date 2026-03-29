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
}

export interface Review {
  id: string;
  shop_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
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
