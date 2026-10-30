-- Apply once to production and preview Neon branches before deploying the feature.
-- A published AI illustration is PUBLIC; draft/failed states are private.
CREATE TABLE IF NOT EXISTS kiranapro.catalog_ai_images (
  image_key char(64) PRIMARY KEY,
  product_name varchar(160) NOT NULL,
  category varchar(100) NOT NULL,
  image_url text,
  status varchar(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','ready','failed')),
  model varchar(64),
  prompt_version varchar(80) NOT NULL DEFAULT 'grocery-studio-v1',
  retry_after timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'ready' OR (image_url IS NOT NULL AND image_url LIKE 'https://%.public.blob.vercel-storage.com/%'))
);
CREATE INDEX IF NOT EXISTS kp_ai_images_status ON kiranapro.catalog_ai_images(status,updated_at DESC);

ALTER TABLE kiranapro.catalog_ai_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiranapro.catalog_ai_images FORCE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON kiranapro.catalog_ai_images TO kiranapro_rls_api;

CREATE POLICY kp_ai_images_public ON kiranapro.catalog_ai_images
  FOR SELECT USING (
    status='ready' OR current_setting('app.role',true) IN ('service','admin')
  );
CREATE POLICY kp_ai_images_service_insert ON kiranapro.catalog_ai_images
  FOR INSERT WITH CHECK (current_setting('app.role',true)='service');
CREATE POLICY kp_ai_images_service_update ON kiranapro.catalog_ai_images
  FOR UPDATE USING (current_setting('app.role',true)='service')
  WITH CHECK (current_setting('app.role',true)='service');
