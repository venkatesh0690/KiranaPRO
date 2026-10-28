// ==============================================================================
// KiranaPRO Neon Serverless PostgreSQL Client
// ==============================================================================
import { neon } from '@neondatabase/serverless';

// Safe resolution of Neon Database connection string
const getDatabaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_NEON_DATABASE_URL) return import.meta.env.VITE_NEON_DATABASE_URL;
    if (import.meta.env.VITE_DATABASE_URL) return import.meta.env.VITE_DATABASE_URL;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  }
  return null;
};

let sqlInstance = null;
export const getNeonSql = () => {
  if (!sqlInstance) {
    const url = getDatabaseUrl();
    if (url) {
      sqlInstance = neon(url);
    }
  }
  return sqlInstance;
};

/**
 * Fetch all registered stores from Neon Database
 */
export async function fetchStoresFromNeon() {
  const sql = getNeonSql();
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT id, name, category, rating, rating_count, distance_km, delivery_eta, delivery_sla, min_order, address, image_url, is_active
      FROM kiranapro.stores
      WHERE is_active = true
      ORDER BY CASE WHEN id = 'localfresh' THEN 0 ELSE 1 END, distance_km ASC;
    `;
    return rows;
  } catch (err) {
    console.warn('[Neon DB] Fetch stores failed, using cached store data:', err.message);
    return null;
  }
}

/**
 * Fetch products for a specific store from Neon Database
 */
export async function fetchProductsFromNeon(storeId) {
  const sql = getNeonSql();
  if (!sql) return null;
  try {
    const rows = await sql`
      SELECT id, store_id, name, original_price, price, unit, category, discount_badge, in_stock, image_url
      FROM kiranapro.products
      WHERE store_id = ${String(storeId)}
      ORDER BY category ASC, name ASC;
    `;
    return rows;
  } catch (err) {
    console.warn(`[Neon DB] Fetch products for store ${storeId} failed:`, err.message);
    return null;
  }
}

/**
 * Record a placed order in Neon Database
 */
export async function recordOrderInNeon(order) {
  const sql = getNeonSql();
  if (!sql) return false;
  try {
    await sql`
      INSERT INTO kiranapro.orders (
        id, store_id, customer_name, customer_phone, delivery_address, items, subtotal, delivery_fee, discount, total, payment_method, status, integrity_hash
      ) VALUES (
        ${order.id || `ORD-${Date.now()}`},
        ${String(order.storeId || 'localfresh')},
        ${order.customerName || 'Anonymous Customer'},
        ${order.customerPhone || 'N/A'},
        ${order.deliveryAddress || 'Current User Location'},
        ${JSON.stringify(order.items || [])},
        ${Number(order.subtotal || 0)},
        ${Number(order.deliveryFee || 0)},
        ${Number(order.discount || 0)},
        ${Number(order.total || 0)},
        ${order.paymentMethod || 'Cash on Delivery'},
        ${order.status || 'Placed'},
        ${order.integrityHash || null}
      );
    `;
    return true;
  } catch (err) {
    console.warn('[Neon DB] Recording order failed:', err.message);
    return false;
  }
}

/**
 * Log a security or audit event to Neon Database
 */
export async function logSecurityEventToNeon(eventType, userRole, ipAddress, details, metadata = {}) {
  const sql = getNeonSql();
  if (!sql) return false;
  try {
    await sql`
      INSERT INTO kiranapro.security_audit_logs (
        event_type, user_role, ip_address, details, metadata
      ) VALUES (
        ${eventType},
        ${userRole || 'ANONYMOUS'},
        ${ipAddress || 'client'},
        ${details || ''},
        ${JSON.stringify(metadata)}
      );
    `;
    return true;
  } catch (err) {
    console.warn('[Neon DB] Audit logging failed:', err.message);
    return false;
  }
}
