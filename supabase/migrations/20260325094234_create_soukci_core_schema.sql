/*
  # SoukCI - Plateforme de découverte de boutiques en Côte d'Ivoire
  
  ## Vue d'ensemble
  Cette migration crée le schéma complet pour SoukCI, une marketplace locale connectant
  acheteurs et commerçants en Côte d'Ivoire.
  
  ## 1. Nouvelles Tables
  
  ### `cities`
  Villes principales de Côte d'Ivoire
  - `id` (uuid, primary key)
  - `name` (text) - Nom de la ville
  - `region` (text) - Région administrative
  - `latitude` (numeric) - Coordonnée latitude
  - `longitude` (numeric) - Coordonnée longitude
  - `created_at` (timestamptz)
  
  ### `categories`
  Catégories de boutiques adaptées au marché local
  - `id` (uuid, primary key)
  - `name` (text) - Nom de la catégorie
  - `name_fr` (text) - Nom en français
  - `icon` (text) - Nom de l'icône
  - `color` (text) - Couleur associée
  - `created_at` (timestamptz)
  
  ### `shops`
  Boutiques/Magasins enregistrés
  - `id` (uuid, primary key)
  - `owner_id` (uuid, foreign key to auth.users) - Propriétaire
  - `name` (text) - Nom de la boutique
  - `description` (text) - Description
  - `category_id` (uuid, foreign key) - Catégorie principale
  - `city_id` (uuid, foreign key) - Ville
  - `address` (text) - Adresse physique
  - `neighborhood` (text) - Quartier
  - `latitude` (numeric) - Coordonnée latitude
  - `longitude` (numeric) - Coordonnée longitude
  - `phone` (text) - Numéro de téléphone
  - `whatsapp` (text) - Numéro WhatsApp
  - `email` (text) - Email
  - `photo_url` (text) - Photo principale
  - `cover_url` (text) - Photo de couverture
  - `has_delivery` (boolean) - Propose la livraison
  - `accepts_wave` (boolean) - Accepte Wave
  - `accepts_orange_money` (boolean) - Accepte Orange Money
  - `accepts_mtn_money` (boolean) - Accepte MTN Money
  - `rating_avg` (numeric) - Note moyenne
  - `rating_count` (integer) - Nombre d'avis
  - `view_count` (integer) - Nombre de vues
  - `click_count` (integer) - Nombre de clics
  - `is_verified` (boolean) - Boutique vérifiée
  - `is_premium` (boolean) - Abonnement premium actif
  - `is_active` (boolean) - Boutique active
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `shop_hours`
  Horaires d'ouverture des boutiques
  - `id` (uuid, primary key)
  - `shop_id` (uuid, foreign key)
  - `day_of_week` (integer) - Jour (0=dimanche, 6=samedi)
  - `opens_at` (time) - Heure d'ouverture
  - `closes_at` (time) - Heure de fermeture
  - `is_closed` (boolean) - Fermé ce jour
  
  ### `products`
  Produits proposés par les boutiques
  - `id` (uuid, primary key)
  - `shop_id` (uuid, foreign key)
  - `name` (text) - Nom du produit
  - `description` (text) - Description
  - `price` (numeric) - Prix en FCFA
  - `photo_url` (text) - Photo du produit
  - `is_featured` (boolean) - Produit phare
  - `is_available` (boolean) - Disponible
  - `created_at` (timestamptz)
  
  ### `reviews`
  Avis et notations des clients
  - `id` (uuid, primary key)
  - `shop_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key to auth.users)
  - `rating` (integer) - Note de 1 à 5
  - `comment` (text) - Commentaire
  - `created_at` (timestamptz)
  
  ### `favorites`
  Boutiques favorites des utilisateurs
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `shop_id` (uuid, foreign key)
  - `created_at` (timestamptz)
  
  ### `promotions`
  Promotions publiées par les commerçants
  - `id` (uuid, primary key)
  - `shop_id` (uuid, foreign key)
  - `title` (text) - Titre de la promotion
  - `description` (text) - Description
  - `discount_percent` (integer) - Pourcentage de réduction
  - `image_url` (text) - Image
  - `starts_at` (timestamptz) - Date de début
  - `ends_at` (timestamptz) - Date de fin
  - `is_active` (boolean) - Active
  - `created_at` (timestamptz)
  
  ### `user_profiles`
  Profils utilisateurs étendus
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text) - Nom complet
  - `phone` (text) - Téléphone
  - `avatar_url` (text) - Photo de profil
  - `is_merchant` (boolean) - Est commerçant
  - `city_id` (uuid, foreign key) - Ville de résidence
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## 2. Sécurité (RLS)
  - Toutes les tables ont RLS activé
  - Politiques restrictives par défaut
  - Lecture publique pour shops, products, categories, cities
  - Modification uniquement par les propriétaires
  - Avis modifiables uniquement par leurs auteurs
  
  ## 3. Indexes
  - Index sur les colonnes de recherche fréquentes
  - Index géographiques pour les coordonnées
  - Index sur les foreign keys
  
  ## 4. Fonctions
  - Fonction de calcul de distance géographique
  - Trigger de mise à jour automatique des notes moyennes
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text NOT NULL,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  TO authenticated, anon
  USING (true);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_fr text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL DEFAULT '#009E60',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  is_merchant boolean DEFAULT false,
  city_id uuid REFERENCES cities(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  city_id uuid REFERENCES cities(id),
  address text,
  neighborhood text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  phone text,
  whatsapp text,
  email text,
  photo_url text,
  cover_url text,
  has_delivery boolean DEFAULT false,
  accepts_wave boolean DEFAULT false,
  accepts_orange_money boolean DEFAULT false,
  accepts_mtn_money boolean DEFAULT false,
  rating_avg numeric(3, 2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shops are viewable by everyone"
  ON shops FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Merchants can insert own shops"
  ON shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Merchants can update own shops"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Merchants can delete own shops"
  ON shops FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Shop hours table
CREATE TABLE IF NOT EXISTS shop_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at time,
  closes_at time,
  is_closed boolean DEFAULT false
);

ALTER TABLE shop_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop hours are viewable by everyone"
  ON shop_hours FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Merchants can manage own shop hours"
  ON shop_hours FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = shop_hours.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(12, 2) NOT NULL,
  photo_url text,
  is_featured boolean DEFAULT false,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO authenticated, anon
  USING (is_available = true);

CREATE POLICY "Merchants can manage own products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, shop_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  discount_percent integer,
  image_url text,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active promotions are viewable by everyone"
  ON promotions FOR SELECT
  TO authenticated, anon
  USING (is_active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY "Merchants can manage own promotions"
  ON promotions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = promotions.shop_id
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = promotions.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city_id);
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops(category_id);
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Function to update shop rating
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops
  SET 
    rating_avg = (
      SELECT AVG(rating)::numeric(3,2)
      FROM reviews
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    )
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic rating updates
DROP TRIGGER IF EXISTS trigger_update_shop_rating ON reviews;
CREATE TRIGGER trigger_update_shop_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_rating();

-- Function to calculate distance between two points (in km)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
RETURNS numeric AS $$
DECLARE
  r numeric := 6371; -- Earth radius in km
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;