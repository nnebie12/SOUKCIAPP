/*
  # SoukCI — Paiements directs, abonnement Premium et verrous serveur

  Ajouts principaux :
  - payment_sessions pour les paiements CinetPay
  - merchant_subscription_state pour l'état Premium synchronisé depuis RevenueCat
  - colonnes de traçabilité de paiement sur orders et campaigns
  - triggers de protection pour empêcher l'élévation client sur premium/paiements/campagnes
*/

CREATE TABLE IF NOT EXISTS payment_sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  provider              text NOT NULL CHECK (provider IN ('cinetpay')),
  status                text NOT NULL DEFAULT 'initiated'
                          CHECK (status IN ('initiated', 'pending', 'paid', 'failed', 'cancelled')),
  amount                numeric(12, 2) NOT NULL,
  currency              text NOT NULL DEFAULT 'XOF',
  transaction_id        text NOT NULL UNIQUE,
  checkout_url          text,
  metadata              jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_response          jsonb,
  paid_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment sessions"
  ON payment_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_user ON payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_transaction ON payment_sessions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);

CREATE TABLE IF NOT EXISTS merchant_subscription_state (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  shop_id               uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  entitlement_id        text NOT NULL,
  platform              text NOT NULL DEFAULT 'android',
  status                text NOT NULL DEFAULT 'inactive'
                          CHECK (status IN ('active', 'inactive', 'expired')),
  expires_at            timestamptz,
  last_synced_at        timestamptz NOT NULL DEFAULT now(),
  raw_customer_info     jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (shop_id, entitlement_id)
);

ALTER TABLE merchant_subscription_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants view own subscription state"
  ON merchant_subscription_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_session_id uuid REFERENCES payment_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_transaction_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_payment_session ON orders(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_sessions_updated_at ON payment_sessions;
CREATE TRIGGER trg_payment_sessions_updated_at
  BEFORE UPDATE ON payment_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_merchant_subscription_state_updated_at ON merchant_subscription_state;
CREATE TRIGGER trg_merchant_subscription_state_updated_at
  BEFORE UPDATE ON merchant_subscription_state
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION current_request_role()
RETURNS text AS $$
BEGIN
  RETURN coalesce(current_setting('request.jwt.claim.role', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION protect_shop_managed_flags()
RETURNS TRIGGER AS $$
BEGIN
  IF current_request_role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    RAISE EXCEPTION 'shop premium status is managed server-side';
  END IF;

  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    RAISE EXCEPTION 'shop verification status is managed server-side';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_shop_managed_flags ON shops;
CREATE TRIGGER trg_protect_shop_managed_flags
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION protect_shop_managed_flags();

CREATE OR REPLACE FUNCTION protect_order_payment_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF current_request_role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_status IS DISTINCT FROM 'pending'
      OR NEW.payment_session_id IS NOT NULL
      OR NEW.payment_provider IS NOT NULL
      OR NEW.payment_transaction_id IS NOT NULL
      OR NEW.paid_at IS NOT NULL THEN
      RAISE EXCEPTION 'order payment fields are managed server-side';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
    OR NEW.payment_session_id IS DISTINCT FROM OLD.payment_session_id
    OR NEW.payment_provider IS DISTINCT FROM OLD.payment_provider
    OR NEW.payment_transaction_id IS DISTINCT FROM OLD.payment_transaction_id
    OR NEW.paid_at IS DISTINCT FROM OLD.paid_at THEN
    RAISE EXCEPTION 'order payment fields are managed server-side';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_order_payment_fields ON orders;
CREATE TRIGGER trg_protect_order_payment_fields
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION protect_order_payment_fields();

CREATE OR REPLACE FUNCTION protect_campaign_managed_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF current_request_role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'draft'
      OR NEW.payment_status IS DISTINCT FROM 'pending'
      OR NEW.payment_provider IS NOT NULL
      OR NEW.paid_at IS NOT NULL THEN
      RAISE EXCEPTION 'campaign billing fields are managed server-side';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
    OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
    OR NEW.payment_provider IS DISTINCT FROM OLD.payment_provider
    OR NEW.paid_at IS DISTINCT FROM OLD.paid_at THEN
    RAISE EXCEPTION 'campaign billing fields are managed server-side';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_campaign_managed_fields ON campaigns;
CREATE TRIGGER trg_protect_campaign_managed_fields
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION protect_campaign_managed_fields();
