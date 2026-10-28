import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stores, productsByCategory } from '../src/data/stores.js';
import { localFreshProductsList } from '../src/data/localfresh.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read DATABASE_URL from .env
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const dbLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
if (!dbLine) {
  console.error('Error: DATABASE_URL not found in .env');
  process.exit(1);
}

const dbUrl = dbLine.split('=')[1].trim().replace(/^["']|["']$/g, '');
const sql = neon(dbUrl);

console.log('--- KiranaPRO Neon Migration & Seed ---');
console.log('Connecting to Neon PostgreSQL database...');

async function run() {
  try {
    // 1. Create Schema
    console.log('Ensuring schema kiranapro exists...');
    await sql`CREATE SCHEMA IF NOT EXISTS kiranapro;`;

    // 2. Create Tables
    console.log('Ensuring tables exist...');
    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kiranapro.security_audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_role VARCHAR(50),
        ip_address VARCHAR(50),
        details TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 3. Seed Stores
    console.log(`Seeding ${stores.length} stores...`);
    let totalStores = 0;
    let totalProducts = 0;

    for (const store of stores) {
      const storeId = String(store.id);
      const distanceNum = parseFloat(String(store.distance || '1.0').replace(/[^\d.]/g, '')) || 1.0;

      await sql`
        INSERT INTO kiranapro.stores (
          id, name, category, rating, rating_count, distance_km, delivery_eta, delivery_sla, min_order, address, image_url, is_active
        ) VALUES (
          ${storeId},
          ${store.name},
          ${store.category || store.type || 'Kirana & Provisions'},
          ${store.rating || 4.5},
          ${store.reviewCount || 100},
          ${distanceNum},
          ${store.deliveryTime || 'Within 30 mins'},
          ${store.deliveryTime || 'Standard'},
          ${store.minOrder || 0},
          ${store.address || 'Vizag Local Partner'},
          ${store.image || store.bannerImage || ''},
          true
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          delivery_eta = EXCLUDED.delivery_eta,
          delivery_sla = EXCLUDED.delivery_sla,
          address = EXCLUDED.address,
          image_url = EXCLUDED.image_url,
          updated_at = NOW();
      `;
      totalStores++;
    }

    // 4. Seed LocalFresh Products (108 Items)
    console.log(`Seeding ${localFreshProductsList.length} LocalFresh products...`);
    for (const p of localFreshProductsList) {
      const prodId = String(p.id);
      const origPrice = Number(p.mrp || p.base_price || p.price || 0);
      const currPrice = Number(p.price || 0);
      const inStock = p.inStock !== false;

      await sql`
        INSERT INTO kiranapro.products (
          id, store_id, name, original_price, price, unit, category, discount_badge, in_stock, image_url
        ) VALUES (
          ${prodId},
          'localfresh',
          ${p.name},
          ${origPrice},
          ${currPrice},
          ${p.unit || 'per unit'},
          ${p.category || 'Fresh Produce'},
          ${p.badge || (p.discount ? `₹${p.discount} OFF` : null)},
          ${inStock},
          ${p.image || ''}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          original_price = EXCLUDED.original_price,
          price = EXCLUDED.price,
          unit = EXCLUDED.unit,
          category = EXCLUDED.category,
          discount_badge = EXCLUDED.discount_badge,
          in_stock = EXCLUDED.in_stock,
          image_url = EXCLUDED.image_url,
          updated_at = NOW();
      `;
      totalProducts++;
    }

    // 5. Seed General Kirana Products from other categories for neighborhood stores
    const generalCategories = ['Dairy & Breakfast', 'Cold Drinks & Juices', 'Snacks & Munchies', 'Household Staples', 'Personal Care'];
    for (const cat of generalCategories) {
      const catProducts = productsByCategory[cat] || [];
      for (const p of catProducts) {
        // Assign to store 1 (Sharma) and store 2 (Sri Lakshmi)
        for (const targetStoreId of ['1', '2']) {
          const prodId = `store-${targetStoreId}-${p.id}`;
          const origPrice = Number(p.mrp || p.price || 0);
          const currPrice = Number(p.price || 0);
          const inStock = p.inStock !== false;

          await sql`
            INSERT INTO kiranapro.products (
              id, store_id, name, original_price, price, unit, category, discount_badge, in_stock, image_url
            ) VALUES (
              ${prodId},
              ${targetStoreId},
              ${p.name},
              ${origPrice},
              ${currPrice},
              ${p.unit || 'per unit'},
              ${p.category || cat},
              ${p.badge || null},
              ${inStock},
              ${p.image || ''}
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              original_price = EXCLUDED.original_price,
              price = EXCLUDED.price,
              unit = EXCLUDED.unit,
              category = EXCLUDED.category,
              discount_badge = EXCLUDED.discount_badge,
              in_stock = EXCLUDED.in_stock,
              image_url = EXCLUDED.image_url,
              updated_at = NOW();
          `;
          totalProducts++;
        }
      }
    }

    // 6. Security Audit Log
    await sql`
      INSERT INTO kiranapro.security_audit_logs (
        event_type, user_role, ip_address, details, metadata
      ) VALUES (
        'NEON_DB_DEPLOYED',
        'SYSTEM',
        '127.0.0.1',
        'KiranaPRO schema initialized and seeded successfully in Neon Serverless Postgres',
        ${JSON.stringify({ totalStores, totalProducts, timestamp: new Date().toISOString() })}
      );
    `;

    console.log(`\n🎉 Successfully migrated and seeded Neon PostgreSQL Database!`);
    console.log(`- Total stores inserted/updated: ${totalStores}`);
    console.log(`- Total products inserted/updated: ${totalProducts}`);

    // Verify row counts
    const storeCount = await sql`SELECT count(*) FROM kiranapro.stores;`;
    const prodCount = await sql`SELECT count(*) FROM kiranapro.products;`;
    console.log(`Verification: kiranapro.stores has ${storeCount[0].count} rows, kiranapro.products has ${prodCount[0].count} rows.`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
