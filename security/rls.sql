-- KiranaPRO: Postgres ownership and access rules.
-- Apply AFTER neon_schema.sql; transactions must set app.user_id/app.role/app.store_id
-- from a VERIFIED server-side session, never from user-controlled request fields.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS kiranapro.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone varchar(20) UNIQUE,
  email varchar(254) UNIQUE,
  display_name varchar(160) NOT NULL,
  password_hash text NOT NULL,
  role varchar(16) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','seller','admin')),
  store_id varchar(64) REFERENCES kiranapro.stores(id),
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((phone IS NOT NULL) OR (email IS NOT NULL)),
  CHECK (role <> 'seller' OR store_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS kiranapro.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES kiranapro.accounts(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kiranapro.login_attempts (
  identifier_hash char(64) PRIMARY KEY,
  failed_count int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kiranapro.orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES kiranapro.accounts(id);
CREATE INDEX IF NOT EXISTS idx_kp_orders_customer ON kiranapro.orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kp_sessions_account ON kiranapro.sessions(account_id, expires_at);

-- Explicit legacy-data treatment: old orders without customer_id are visible
-- only to verified admins, not guessed by matching unverified phone numbers.
-- Do not backfill customer_id from phone numbers.

-- RLS is FORCED so the app database owner cannot accidentally bypass it.
ALTER TABLE kiranapro.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.stores FORCE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.products FORCE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.security_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.login_attempts FORCE ROW LEVEL SECURITY;

-- All roles/settings are supplied ONLY within one database transaction
-- by the Vercel server. "service" is never given to a browser.
CREATE POLICY kp_stores_read ON kiranapro.stores FOR SELECT USING (
  is_active = true
  OR current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND id = current_setting('app.store_id', true))
);
CREATE POLICY kp_stores_write ON kiranapro.stores FOR ALL USING (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND id = current_setting('app.store_id', true))
) WITH CHECK (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND id = current_setting('app.store_id', true))
);

CREATE POLICY kp_products_read ON kiranapro.products FOR SELECT USING (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND store_id = current_setting('app.store_id', true))
  OR EXISTS(SELECT 1 FROM kiranapro.stores s WHERE s.id=store_id AND s.is_active=true)
);
CREATE POLICY kp_products_write ON kiranapro.products FOR ALL USING (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND store_id = current_setting('app.store_id', true))
) WITH CHECK (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND store_id = current_setting('app.store_id', true))
);

CREATE POLICY kp_orders_read ON kiranapro.orders FOR SELECT USING (
  current_setting('app.role', true) IN ('admin','service')
  OR (customer_id IS NOT NULL AND customer_id::text = current_setting('app.user_id', true))
  OR (current_setting('app.role', true) = 'seller' AND store_id = current_setting('app.store_id', true))
);
CREATE POLICY kp_orders_insert ON kiranapro.orders FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'customer'
      AND customer_id IS NOT NULL AND customer_id::text = current_setting('app.user_id', true))
);
CREATE POLICY kp_orders_update ON kiranapro.orders FOR UPDATE USING (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND store_id = current_setting('app.store_id', true))
) WITH CHECK (
  current_setting('app.role', true) IN ('admin','service')
  OR (current_setting('app.role', true) = 'seller' AND store_id = current_setting('app.store_id', true))
);
-- No client / seller deletion policy.

CREATE POLICY kp_audit_read ON kiranapro.security_audit_logs FOR SELECT USING (
  current_setting('app.role', true) IN ('admin','service')
);
CREATE POLICY kp_audit_insert ON kiranapro.security_audit_logs FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin','service')
);
CREATE POLICY kp_accounts_read ON kiranapro.accounts FOR SELECT USING (
  current_setting('app.role', true) IN ('admin','service')
  OR id::text=current_setting('app.user_id', true)
);
CREATE POLICY kp_accounts_write ON kiranapro.accounts FOR ALL USING (
  current_setting('app.role', true)='service'
) WITH CHECK (current_setting('app.role', true)='service');
CREATE POLICY kp_sessions_service ON kiranapro.sessions FOR ALL USING (
  current_setting('app.role', true)='service'
) WITH CHECK (current_setting('app.role', true)='service');
CREATE POLICY kp_attempts_service ON kiranapro.login_attempts FOR ALL USING (
  current_setting('app.role', true)='service'
) WITH CHECK (current_setting('app.role', true)='service');

-- Tighten schema exposure: ordinary Postgres PUBLIC gets no direct DML on
-- sensitive data, even when another database role is added later.
REVOKE ALL ON SCHEMA kiranapro FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA kiranapro FROM PUBLIC;

-- Neon-managed login roles may carry BYPASSRLS. Every API transaction must
-- explicitly SET LOCAL ROLE to a non-login, NOBYPASSRLS principal before
-- running any application queries, including authentication queries.
CREATE ROLE kiranapro_rls_api NOLOGIN NOINHERIT NOBYPASSRLS;
GRANT kiranapro_rls_api TO neondb_owner;
GRANT USAGE ON SCHEMA kiranapro TO kiranapro_rls_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA kiranapro TO kiranapro_rls_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA kiranapro TO kiranapro_rls_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA kiranapro GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kiranapro_rls_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA kiranapro GRANT USAGE, SELECT ON SEQUENCES TO kiranapro_rls_api;
