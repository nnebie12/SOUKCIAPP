CREATE TABLE IF NOT EXISTS account_deletion_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  source text NOT NULL DEFAULT 'unknown',
  requested_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE account_deletion_audit ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_account_deletion_audit_user_id
  ON account_deletion_audit(user_id);

CREATE INDEX IF NOT EXISTS idx_account_deletion_audit_requested_at
  ON account_deletion_audit(requested_at DESC);