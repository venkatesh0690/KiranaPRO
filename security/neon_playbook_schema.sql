-- KiranaPRO Neon Serverless Postgres Schema Definition
-- Supporting Multi-Role Access: CUSTOMER, KIRANA_SELLER, RIDER, ADMIN
-- In-house Fleet Operations, Mandi Field Reports & COD Cash Reconciliation

CREATE SCHEMA IF NOT EXISTS kiranapro;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS kiranapro.users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('CUSTOMER', 'KIRANA_SELLER', 'RIDER', 'ADMIN')),
  area_id VARCHAR(64) NOT NULL CHECK (area_id IN ('siripuram', 'nad_kotha_road', 'dabagardens', 'mvp_colony', 'gajuwaka')),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON kiranapro.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_area ON kiranapro.users(area_id);

-- 2. Stores Table
CREATE TABLE IF NOT EXISTS kiranapro.stores (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL CHECK (type IN ('KIRANA', 'MANDI_HUB')),
  owner_user_id VARCHAR(64) REFERENCES kiranapro.users(id),
  area_id VARCHAR(64) NOT NULL,
  address TEXT NOT NULL,
  distance_km NUMERIC(4, 2) DEFAULT 0.5,
  rating NUMERIC(3, 2) DEFAULT 4.8,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Items Table (Direct Kirana & Mandi Hub Stock Counts)
CREATE TABLE IF NOT EXISTS kiranapro.inventory_items (
  id VARCHAR(64) PRIMARY KEY,
  store_id VARCHAR(64) NOT NULL REFERENCES kiranapro.stores(id),
  item_name VARCHAR(255) NOT NULL,
  telugu_synonyms TEXT[],
  category VARCHAR(64) NOT NULL,
  unit VARCHAR(64) NOT NULL,
  mrp_price NUMERIC(10, 2) NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  mandi_base_rate NUMERIC(10, 2),
  stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  image_url TEXT,
  last_updated_by_role VARCHAR(32) CHECK (last_updated_by_role IN ('KIRANA_SELLER', 'ADMIN', 'RIDER_REPORT')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_inventory_store_item ON kiranapro.inventory_items(store_id, item_name);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON kiranapro.inventory_items(category);

-- 4. Mandi Field Reports Table (Delivery Person Reports to Admin)
CREATE TABLE IF NOT EXISTS kiranapro.mandi_field_reports (
  id VARCHAR(64) PRIMARY KEY,
  rider_id VARCHAR(64) NOT NULL REFERENCES kiranapro.users(id),
  mandi_store_id VARCHAR(64) NOT NULL REFERENCES kiranapro.stores(id),
  item_id VARCHAR(64) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  observed_mandi_price NUMERIC(10, 2) NOT NULL,
  observed_stock_status VARCHAR(32) NOT NULL CHECK (observed_stock_status IN ('AVAILABLE_HIGH', 'AVAILABLE_LOW', 'OUT_OF_STOCK')),
  estimated_available_qty NUMERIC(10, 2),
  quality_grade VARCHAR(32) NOT NULL CHECK (quality_grade IN ('A_GRADE', 'STANDARD', 'SKIP')),
  rider_notes TEXT,
  photo_url TEXT,
  status VARCHAR(32) DEFAULT 'PENDING_ADMIN_REVIEW' CHECK (status IN ('PENDING_ADMIN_REVIEW', 'APPROVED_AND_PUBLISHED', 'REJECTED')),
  reviewed_by_admin_id VARCHAR(64) REFERENCES kiranapro.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_mandi_reports_status ON kiranapro.mandi_field_reports(status);

-- 5. Orders Table (High-Trust Cash on Delivery & 4-Digit Delivery PIN)
CREATE TABLE IF NOT EXISTS kiranapro.orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number SERIAL,
  customer_id VARCHAR(64) NOT NULL REFERENCES kiranapro.users(id),
  store_id VARCHAR(64) NOT NULL REFERENCES kiranapro.stores(id),
  rider_id VARCHAR(64) REFERENCES kiranapro.users(id),
  area_id VARCHAR(64) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_type VARCHAR(32) DEFAULT 'STANDARD_2HR' CHECK (delivery_type IN ('STANDARD_2HR', 'SCHEDULED', 'PICKUP')),
  item_total NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 2.00,
  handling_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
  gst_amount NUMERIC(10, 2) DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  coupon_code VARCHAR(32),
  total_to_pay NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(32) DEFAULT 'COD',
  cod_change_requested_for INTEGER,
  delivery_pin VARCHAR(4) NOT NULL,
  status VARCHAR(64) DEFAULT 'PLACED' CHECK (status IN (
    'PLACED', 'CONFIRMED', 'ASSIGNED_TO_RIDER', 'PICKED_UP_FROM_KIRANA_OR_MANDI',
    'OUT_FOR_DELIVERY', 'DELIVERED_COD_COLLECTED', 'CANCELLED'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON kiranapro.orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON kiranapro.orders(status);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS kiranapro.order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES kiranapro.orders(id) ON DELETE CASCADE,
  inventory_item_id VARCHAR(64) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  unit VARCHAR(64) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL
);

-- 7. Rider Cash Ledger Table (End-of-Shift Reconciliation)
CREATE TABLE IF NOT EXISTS kiranapro.rider_cash_ledger (
  id VARCHAR(64) PRIMARY KEY,
  rider_id VARCHAR(64) NOT NULL REFERENCES kiranapro.users(id),
  order_id VARCHAR(64) NOT NULL REFERENCES kiranapro.orders(id),
  cash_collected_amount NUMERIC(10, 2) NOT NULL,
  change_given NUMERIC(10, 2) DEFAULT 0.00,
  settlement_status VARCHAR(32) DEFAULT 'HELD_BY_RIDER' CHECK (settlement_status IN ('HELD_BY_RIDER', 'HANDED_OVER_TO_ADMIN')),
  settled_at TIMESTAMPTZ,
  verified_by_admin_id VARCHAR(64) REFERENCES kiranapro.users(id)
);
CREATE INDEX IF NOT EXISTS idx_rider_cash_status ON kiranapro.rider_cash_ledger(rider_id, settlement_status);

-- 8. Stock Audit Logs Table
CREATE TABLE IF NOT EXISTS kiranapro.stock_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  inventory_item_id VARCHAR(64) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  previous_stock_count INTEGER NOT NULL,
  new_stock_count INTEGER NOT NULL,
  changed_by_user_id VARCHAR(64),
  changed_by_role VARCHAR(32) NOT NULL,
  reason VARCHAR(64) NOT NULL CHECK (reason IN (
    'DIRECT_KIRANA_UPDATE', 'ADMIN_OVERRIDE', 'MANDI_RIDER_APPROVAL',
    'ORDER_DEDUCTION', 'ORDER_CANCELLATION_RESTORE'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
