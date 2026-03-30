/*
  # SoukCI — Migration : Panier, Commandes, Campagnes & Seed
  
  Nouvelles tables :
  - cart_items       : éléments dans le panier utilisateur
  - orders           : commandes passées
  - order_items      : lignes de commandes
  - campaigns        : campagnes publicitaires des commerçants
  - campaign_plans   : forfaits disponibles (Basic / Premium / Boost)
  
  Extensions de la table reviews :
  - photos[]         : tableau de photos jointes à un avis
  - helpful_count    : nombre de "utile" reçus
  - merchant_reply   : réponse du commerçant
  - merchant_reply_at: date de la réponse
*/

-- ─── CART ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  shop_id     uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  quantity    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users ON DELETE SET NULL,
  shop_id         uuid REFERENCES shops(id) ON DELETE SET NULL NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  total_amount    numeric(12, 2) NOT NULL DEFAULT 0,
  delivery_address text,
  delivery_fee    numeric(12, 2) DEFAULT 0,
  payment_method  text CHECK (payment_method IN ('wave','orange_money','mtn_money','cash')),
  payment_status  text NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants view shop orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = orders.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Merchants update shop order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = orders.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop   ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id  uuid REFERENCES products(id) ON DELETE SET NULL,
  name        text NOT NULL,
  price       numeric(12, 2) NOT NULL,
  quantity    integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal    numeric(12, 2) GENERATED ALWAYS AS (price * quantity) STORED
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items visible to order owner or merchant"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM shops
            WHERE shops.id = orders.shop_id
              AND shops.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Users insert order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── CAMPAIGN PLANS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_plans (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,          -- 'basic' | 'premium' | 'boost'
  label_fr       text NOT NULL,          -- 'Basic' | 'Premium' | 'Boost'
  price_fcfa     integer NOT NULL,
  duration_days  integer NOT NULL,
  features       jsonb NOT NULL DEFAULT '[]',
  highlight      boolean DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE campaign_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON campaign_plans FOR SELECT
  TO authenticated, anon
  USING (true);

-- ─── CAMPAIGNS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  plan_id         uuid REFERENCES campaign_plans(id) NOT NULL,
  title           text NOT NULL,
  description     text,
  image_url       text,
  target_city_id  uuid REFERENCES cities(id),
  target_category_id uuid REFERENCES categories(id),
  budget_fcfa     integer,
  impressions     integer DEFAULT 0,
  clicks          integer DEFAULT 0,
  status          text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','active','paused','completed','cancelled')),
  starts_at       timestamptz DEFAULT now(),
  ends_at         timestamptz,
  payment_status  text NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending','paid','failed')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active campaigns visible to everyone"
  ON campaigns FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

CREATE POLICY "Merchants manage own campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = campaigns.shop_id
        AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = campaigns.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_campaigns_shop   ON campaigns(shop_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ─── REVIEWS EXTENSION ───────────────────────────────────────────────────────
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS photos          text[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS helpful_count   integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS merchant_reply  text,
  ADD COLUMN IF NOT EXISTS merchant_reply_at timestamptz;

-- Politique : le commerçant peut répondre à un avis de sa boutique
CREATE POLICY IF NOT EXISTS "Merchants can reply to reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = reviews.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

-- ─── TRIGGER : updated_at automatique ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── SEED : Campaign Plans ────────────────────────────────────────────────────
INSERT INTO campaign_plans (name, label_fr, price_fcfa, duration_days, features, highlight)
VALUES
  (
    'basic', 'Basic', 5000, 7,
    '["Visible dans la liste locale","Badge \"Nouveauté\"","Jusqu''à 200 impressions"]',
    false
  ),
  (
    'premium', 'Premium', 15000, 30,
    '["Mise en avant sur la page d''accueil","Badge \"Premium\"","Statistiques détaillées","Jusqu''à 2 000 impressions"]',
    true
  ),
  (
    'boost', 'Boost', 35000, 30,
    '["Priorité maximale dans les recherches","Badge \"Boost\"","Campagne multi-villes","Jusqu''à 10 000 impressions","Support dédié"]',
    false
  )
ON CONFLICT DO NOTHING;

-- ─── SEED : Fictitious shops data (cities & categories already exist) ─────────
-- Note : ce seed suppose que des villes et catégories ont déjà été insérées
-- par la migration principale. Il crée 3 boutiques fictives avec produits & avis.

DO $$
DECLARE
  v_city_id    uuid;
  v_cat_id     uuid;
  v_shop1      uuid;
  v_shop2      uuid;
  v_shop3      uuid;
BEGIN
  -- Récupérer une ville et une catégorie existantes (si présentes)
  SELECT id INTO v_city_id FROM cities LIMIT 1;
  SELECT id INTO v_cat_id  FROM categories LIMIT 1;

  IF v_city_id IS NULL OR v_cat_id IS NULL THEN
    RAISE NOTICE 'Seed ignoré : aucune ville ou catégorie trouvée.';
    RETURN;
  END IF;

  -- Boutique 1
  INSERT INTO shops (id, owner_id, name, description, category_id, city_id,
                     address, neighborhood, phone, whatsapp,
                     has_delivery, accepts_wave, accepts_orange_money,
                     rating_avg, rating_count, view_count, click_count,
                     is_verified, is_premium, is_active)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Boutique Adjoua Beauté',
    'Cosmétiques et soins capillaires naturels africains. Livraison rapide à Abidjan.',
    v_cat_id, v_city_id,
    'Rue des Jardins, Cocody', 'Cocody', '+225 07 12 34 56', '+225 07 12 34 56',
    true, true, true, 4.6, 28, 340, 120, true, true, true
  ) RETURNING id INTO v_shop1;

  -- Boutique 2
  INSERT INTO shops (id, owner_id, name, description, category_id, city_id,
                     address, neighborhood, phone, whatsapp,
                     has_delivery, accepts_wave, accepts_mtn_money,
                     rating_avg, rating_count, view_count, click_count,
                     is_verified, is_active)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002',
    'Électro Kouassi',
    'Vente et réparation de téléphones, accessoires et électronique.',
    v_cat_id, v_city_id,
    'Avenue Chardy, Plateau', 'Plateau', '+225 05 98 76 54', '+225 05 98 76 54',
    false, true, true, 4.2, 15, 210, 80, true, true
  ) RETURNING id INTO v_shop2;

  -- Boutique 3
  INSERT INTO shops (id, owner_id, name, description, category_id, city_id,
                     address, neighborhood, phone, whatsapp,
                     has_delivery, accepts_orange_money,
                     rating_avg, rating_count, view_count, click_count,
                     is_active)
  VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000003',
    'Maquis Chez Mamadou',
    'Cuisine ivoirienne traditionnelle : attiéké, alloco, poisson braisé.',
    v_cat_id, v_city_id,
    'Boulevard Latrille, Yopougon', 'Yopougon', '+225 01 23 45 67', '+225 01 23 45 67',
    true, true, 4.8, 42, 560, 230, true
  ) RETURNING id INTO v_shop3;

  -- Produits boutique 1
  IF v_shop1 IS NOT NULL THEN
    INSERT INTO products (shop_id, name, description, price, is_featured, is_available)
    VALUES
      (v_shop1, 'Huile de coco bio 250ml', 'Soin capillaire naturel pressé à froid', 3500, true, true),
      (v_shop1, 'Shea butter naturel 200g', 'Karité pur du Burkina Faso', 4200, true, true),
      (v_shop1, 'Savon noir africain 150g', 'Nettoyant corps et visage traditionnel', 1500, false, true);
  END IF;

  -- Produits boutique 2
  IF v_shop2 IS NOT NULL THEN
    INSERT INTO products (shop_id, name, description, price, is_featured, is_available)
    VALUES
      (v_shop2, 'Câble USB-C 2m', 'Charge rapide compatible Android', 2000, false, true),
      (v_shop2, 'Coque iPhone 14', 'Protection transparente renforcée', 3000, true, true),
      (v_shop2, 'Écouteurs Bluetooth', 'Sans fil, autonomie 8h', 15000, true, true);
  END IF;

  -- Produits boutique 3
  IF v_shop3 IS NOT NULL THEN
    INSERT INTO products (shop_id, name, description, price, is_featured, is_available)
    VALUES
      (v_shop3, 'Assiette Attiéké Poisson', 'Attiéké frais + poisson braisé + sauce', 2500, true, true),
      (v_shop3, 'Alloco Viande', 'Banane plantain frite + viande + sauce tomate', 2000, true, true),
      (v_shop3, 'Jus gingembre 50cl', 'Jus naturel maison pimenté', 500, false, true);
  END IF;

END $$;
