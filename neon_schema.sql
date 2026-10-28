-- ==============================================================================
-- KiranaPRO Enterprise Neon Serverless PostgreSQL Schema
-- Database: neondb
-- Dedicated Isolated Schema: kiranapro
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS kiranapro;

-- 1. Stores Table
CREATE TABLE IF NOT EXISTS kiranapro.stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 4.5,
    rating_count INT DEFAULT 0,
    distance_km NUMERIC(4, 2) NOT NULL,
    delivery_eta VARCHAR(50) NOT NULL,
    delivery_sla VARCHAR(100) NOT NULL,
    min_order INT DEFAULT 0,
    address TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS kiranapro.products (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES kiranapro.stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_price NUMERIC(10, 2) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    discount_badge VARCHAR(50),
    in_stock BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS kiranapro.orders (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) REFERENCES kiranapro.stores(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    status VARCHAR(50) DEFAULT 'Placed',
    integrity_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS kiranapro.security_audit_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_role VARCHAR(50),
    ip_address VARCHAR(50),
    details TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_kiranapro_products_store_id ON kiranapro.products(store_id);
CREATE INDEX IF NOT EXISTS idx_kiranapro_products_category ON kiranapro.products(category);
CREATE INDEX IF NOT EXISTS idx_kiranapro_orders_store_id ON kiranapro.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_kiranapro_orders_created_at ON kiranapro.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kiranapro_audit_logs_event ON kiranapro.security_audit_logs(event_type);
