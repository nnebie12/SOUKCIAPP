/*
  # Fonctions RPC et améliorations MVP

  ## 1. Fonction increment_view_count
  Incrémente atomiquement le view_count d'une boutique
  
  ## 2. Fonction increment_click_count
  Incrémente atomiquement le click_count d'une boutique

  ## 3. Index de performance
  Index sur les colonnes fréquemment filtrées
*/

-- Fonction pour incrémenter les vues (appelée anonymement)
CREATE OR REPLACE FUNCTION increment_view_count(shop_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE shops
  SET view_count = view_count + 1
  WHERE id = shop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter les clics
CREATE OR REPLACE FUNCTION increment_click_count(shop_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE shops
  SET click_count = click_count + 1
  WHERE id = shop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les droits d'exécution aux anonymes et authentifiés
GRANT EXECUTE ON FUNCTION increment_view_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_click_count(uuid) TO anon, authenticated;

-- Index de performance pour les filtres fréquents
CREATE INDEX IF NOT EXISTS idx_shops_category_id ON shops(category_id);
CREATE INDEX IF NOT EXISTS idx_shops_city_id ON shops(city_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active);
CREATE INDEX IF NOT EXISTS idx_shops_is_premium ON shops(is_premium);
CREATE INDEX IF NOT EXISTS idx_shops_rating_avg ON shops(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_shop_id_active ON promotions(shop_id, is_active);
CREATE INDEX IF NOT EXISTS idx_shop_hours_shop_id ON shop_hours(shop_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop_id ON reviews(shop_id);

-- Politique RLS : tout le monde peut lire les promotions actives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'Promotions actives visibles'
  ) THEN
    CREATE POLICY "Promotions actives visibles"
      ON promotions FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;

-- Politique RLS : tout le monde peut lire shop_hours
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shop_hours' AND policyname = 'Horaires publics'
  ) THEN
    CREATE POLICY "Horaires publics"
      ON shop_hours FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
