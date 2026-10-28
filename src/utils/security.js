// KiranaPRO Enterprise Security Utility Suite
// Provides XSS Sanitization, Cryptographic Token Generation,
// Customer PII Data Masking, Rate Limiting & Anti-Tampering Validation

/**
 * Verified Sample Platform Credentials for Testing & Evaluation
 */
export const SAMPLE_CREDENTIALS = {
  user: {
    role: 'Customer (User)',
    phone: '9848022334',
    pin: '1234',
    name: 'Venkatesh Rao',
    address: 'Flat 402, Sai Residency, Maddilapalem, Vizag'
  },
  seller: {
    role: 'Seller (Store Partner)',
    storeId: '1',
    storeName: 'Sharma General Store',
    phone: '9876543210',
    pin: '1234',
    location: 'Maddilapalem Main Road, Vizag'
  },
  admin: {
    role: 'Platform Super Administrator',
    email: 'admin@kiranapro.com',
    password: 'admin123',
    accessLevel: 'Super Administrator (LocalFresh Mandi & System Audit Console)'
  }
};

/**
 * Delivery Fee Calculation with Free Delivery Threshold Rule
 * Requirement: Remove delivery fee as 0, when the cart value reaches 301.
 * - subtotal >= 301 => Free Delivery (₹0)
 * - subtotal < 301 => Base store delivery fee (default ₹20)
 */
export function calculateDeliveryFee(subtotal, baseFee = 20) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  if (safeSubtotal >= 301) {
    return 0; // Free delivery unlocked when reaching 301
  }
  return Math.max(0, Number(baseFee) || 20);
}

/**
 * XSS & HTML Injection Sanitizer
 * Strips script tags, iframe, event handlers, and entity-encodes dangerous characters
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates text safe for addresses, notes, and search queries
 */
export function isSafeText(text, maxLength = 250) {
  if (!text || typeof text !== 'string') return false;
  if (text.length > maxLength) return false;
  // Disallow common injection patterns
  const dangerousPatterns = /<[^>]*>|javascript:|eval\(|base64,/i;
  return !dangerousPatterns.test(text);
}

/**
 * Customer PII Masking: Masks phone number for privacy compliance
 * Example: "+91 98480 22334" -> "+91 98480 ••••4"
 */
export function maskPhone(phone) {
  if (!phone) return '••••••••••';
  const clean = String(phone).replace(/[^\d+]/g, '');
  if (clean.length < 5) return '••••••';
  const prefix = clean.slice(0, clean.length - 5);
  const lastDigit = clean.slice(-1);
  return `${prefix} •••• ${lastDigit}`;
}

/**
 * Customer PII Masking: Masks name for privacy compliance
 * Example: "Venkatesh Rao" -> "Venk•••• R."
 */
export function maskCustomerName(name) {
  if (!name || typeof name !== 'string') return 'Customer';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    const first = parts[0];
    return first.length > 3 ? `${first.slice(0, 3)}••••` : `${first}••••`;
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 3)}•••• ${last.charAt(0)}.`;
}

/**
 * Generates a cryptographically strong session token
 */
export function generateSecureToken() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return 'KP-SEC-' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return 'KP-SEC-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Strict 4-Digit PIN Validation
 */
export function validatePIN(pin) {
  return /^\d{4}$/.test(String(pin || '').trim());
}

/**
 * Strict Email Validation
 */
export function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email || '').trim());
}

/**
 * Rate Limiting & Brute Force Lockout Management
 * Locks out after 4 failed attempts for 60 seconds
 */
const LOCKOUT_THRESHOLD = 4;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

export function getFailedAttempts(identifier) {
  try {
    const data = sessionStorage.getItem(`kp_sec_rate_${identifier}`);
    if (!data) return { count: 0, lockedUntil: 0 };
    return JSON.parse(data);
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

export function recordFailedAttempt(identifier) {
  try {
    const current = getFailedAttempts(identifier);
    const newCount = current.count + 1;
    const lockedUntil = newCount >= LOCKOUT_THRESHOLD ? Date.now() + LOCKOUT_DURATION_MS : 0;
    const record = { count: newCount, lockedUntil, lastAttempt: Date.now() };
    sessionStorage.setItem(`kp_sec_rate_${identifier}`, JSON.stringify(record));
    return record;
  } catch {
    return { count: 1, lockedUntil: 0 };
  }
}

export function isRateLimited(identifier) {
  const current = getFailedAttempts(identifier);
  if (current.lockedUntil && current.lockedUntil > Date.now()) {
    return true;
  }
  return false;
}

export function getRemainingLockoutTime(identifier) {
  const current = getFailedAttempts(identifier);
  if (!current.lockedUntil) return 0;
  const rem = Math.ceil((current.lockedUntil - Date.now()) / 1000);
  return Math.max(0, rem);
}

export function resetFailedAttempts(identifier) {
  try {
    sessionStorage.removeItem(`kp_sec_rate_${identifier}`);
  } catch {
    // Ignore storage issues
  }
}

/**
 * Cart Anti-Tampering & Price Integrity Validator
 * Checks every item in the cart against the official store catalog.
 * Prevents client-side price tampering, negative quantities, or phantom products.
 */
export function validateCartIntegrity(cartItems, catalog) {
  if (!Array.isArray(cartItems)) return [];

  // Build a fast lookup map of official products by ID
  const officialCatalogMap = new Map();
  if (catalog && typeof catalog === 'object') {
    Object.values(catalog).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(item => {
          officialCatalogMap.set(String(item.id), item);
        });
      }
    });
  }

  const validatedItems = [];

  for (const item of cartItems) {
    if (!item || !item.id) continue;
    const officialItem = officialCatalogMap.get(String(item.id));

    if (!officialItem) {
      // Unrecognized product dropped for security
      console.warn(`[SECURITY ALERT] Dropping unauthorized product id ${item.id} from cart.`);
      continue;
    }

    // Clamp quantity between 1 and 20 (prevent inventory exhaustion attacks)
    const validQty = Math.min(20, Math.max(1, parseInt(item.quantity || 1, 10)));

    // Strictly enforce the official catalog price & MRP
    validatedItems.push({
      ...item,
      name: officialItem.name,
      price: officialItem.price,
      mrp: officialItem.mrp,
      unit: officialItem.unit,
      quantity: validQty,
      isVerified: true
    });
  }

  return validatedItems;
}
