-- Single-use, short-lived administrator bootstrap capability.
-- Token is never stored in plaintext, and is consumed atomically before the
-- first administrator account is inserted.
CREATE TABLE IF NOT EXISTS kiranapro.admin_setup_claims (
  token_hash char(64) PRIMARY KEY,
  claimed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE kiranapro.admin_setup_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.admin_setup_claims FORCE ROW LEVEL SECURITY;
GRANT INSERT, SELECT ON kiranapro.admin_setup_claims TO kiranapro_rls_api;
CREATE POLICY kp_admin_claims_service_select ON kiranapro.admin_setup_claims
 FOR SELECT USING (current_setting('app.role',true)='service');
CREATE POLICY kp_admin_claims_service_insert ON kiranapro.admin_setup_claims
 FOR INSERT WITH CHECK (current_setting('app.role',true)='service');
