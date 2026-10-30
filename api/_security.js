import { neon } from '@neondatabase/serverless';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const SESSION_SECONDS = 2 * 60 * 60;
const COOKIE = 'kp_session';

export function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be configured on the server.');
  return neon(process.env.DATABASE_URL);
}
export const digest = value => createHash('sha256').update(value).digest('hex');

// Neon HTTP transactions keep PostgreSQL session GUCs scoped to one request,
// avoiding cross-request identity leaks from pooled connections.
export async function scopedQuery(identity, build) {
  const sql = database();
  const role = identity?.role || '';
  const uid = identity?.id || '';
  const store = identity?.storeId || '';
  const queries = build(sql);
  if (!Array.isArray(queries) || queries.length !== 1) throw new Error('Scoped query must be a single statement.');
  const result = await sql.transaction([
    // RLS is ineffective with Neon owner credentials unless we switch to a
    // non-BYPASSRLS role within every request-local transaction.
    sql`SET LOCAL ROLE kiranapro_rls_api`,
    sql`SELECT set_config('app.role', ${role}, true), set_config('app.user_id', ${uid}, true), set_config('app.store_id', ${store}, true)`,
    queries[0]
  ], { readOnly: false });
  return result[1];
}
export const serviceQuery = build => scopedQuery({ role: 'service' }, build);
export const currentQuery = (identity, build) => scopedQuery(identity, build);

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, Buffer.from(salt, 'hex'), 64);
  return `scrypt:v1:${salt}:${hash.toString('hex')}`;
}
export async function checkPassword(password, encoded) {
  const parts = String(encoded || '').split(':');
  if (parts.length !== 4 || parts[0] !== 'scrypt' || parts[1] !== 'v1' ||
      !/^[a-f0-9]{32}$/.test(parts[2]) || !/^[a-f0-9]{128}$/.test(parts[3])) return false;
  const comparison = await scrypt(password, Buffer.from(parts[2], 'hex'), 64);
  return timingSafeEqual(comparison, Buffer.from(parts[3], 'hex'));
}
export const validPassword = value => typeof value === 'string' && value.length >= 10 && value.length <= 128;
export const cleanPhone = value => String(value || '').replace(/\D/g, '').slice(-10);
export const validPhone = value => /^[6-9]\d{9}$/.test(cleanPhone(value));
export const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '')) && String(value).length <= 254;

export function safeMethod(req, res, allow) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!allow.includes(req.method)) {
    res.setHeader('Allow',allow.join(', '));
    res.status(405).json({error:'Method not allowed'});
    return false;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.origin;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (!origin || !host || new URL(origin).host !== host || req.headers['x-kirana-client'] !== 'web' ||
        !String(req.headers['content-type'] || '').startsWith('application/json')) {
      res.status(403).json({error:'Cross-site request blocked'});
      return false;
    }
  }
  return true;
}
export function bodyOf(req) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body');
  return body;
}
function cookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(p => {
    const index = p.indexOf('=');
    return index < 0 ? ['',''] : [p.slice(0,index).trim(),p.slice(index+1).trim()];
  }));
}
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=0`);
}
export async function createSession(res, account) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = digest(token);
  await serviceQuery(sql => [sql`
    INSERT INTO kiranapro.sessions (account_id, token_hash, expires_at)
    VALUES (${account.id}, ${tokenHash}, NOW() + INTERVAL '2 hours')
  `]);
  res.setHeader('Set-Cookie',`${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${SESSION_SECONDS}`);
  return publicAccount(account);
}
export function publicAccount(a) {
  return {isAuthenticated:true,role:a.role, userId:a.id,storeId:a.store_id ?? null,
    userName:a.display_name, userPhone:a.phone ? `+91 ${a.phone}` : null,
    expiresAt:Date.now()+SESSION_SECONDS*1000};
}
export async function getSession(req) {
  const token = cookies(req)[COOKIE];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const hash = digest(token);
  const rows = await serviceQuery(sql => [sql`
    SELECT a.id, a.role, a.phone, a.email, a.display_name, a.store_id, a.approved
    FROM kiranapro.sessions s
    JOIN kiranapro.accounts a ON a.id=s.account_id
    WHERE s.token_hash=${hash} AND s.expires_at > NOW()
    LIMIT 1
  `]);
  const account = rows[0];
  if (!account || (account.role==='seller' && !account.approved)) return null;
  return {id:account.id,role:account.role,storeId:account.store_id,account};
}
export async function requireUser(req,res,roles) {
  const s=await getSession(req);
  if (!s) {res.status(401).json({error:'Sign in required'}); return null;}
  if (!roles.includes(s.role)) {res.status(403).json({error:'Access denied'});return null;}
  return s;
}
export async function revokeSession(req,res) {
  const token = cookies(req)[COOKIE];
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    await serviceQuery(sql => [sql`DELETE FROM kiranapro.sessions WHERE token_hash=${digest(token)}`]);
  }
  clearSessionCookie(res);
}
export async function checkThrottle(key) {
  const rows = await serviceQuery(sql => [sql`SELECT locked_until FROM kiranapro.login_attempts WHERE identifier_hash=${digest(key)}`]);
  return rows[0]?.locked_until && new Date(rows[0].locked_until) > new Date();
}
export async function failAttempt(key) {
  const hash=digest(key);
  await serviceQuery(sql => [sql`
    INSERT INTO kiranapro.login_attempts(identifier_hash,failed_count,locked_until)
    VALUES (${hash}, 1, NULL)
    ON CONFLICT(identifier_hash) DO UPDATE SET
      failed_count=CASE WHEN kiranapro.login_attempts.updated_at < NOW() - INTERVAL '15 minutes' THEN 1
                       ELSE kiranapro.login_attempts.failed_count + 1 END,
      locked_until=CASE WHEN kiranapro.login_attempts.updated_at < NOW() - INTERVAL '15 minutes' THEN NULL
                        WHEN kiranapro.login_attempts.failed_count >= 4 THEN NOW() + INTERVAL '15 minutes'
                        ELSE kiranapro.login_attempts.locked_until END,
      updated_at=NOW()
  `]);
}
export async function clearAttempts(key) {
  await serviceQuery(sql => [sql`DELETE FROM kiranapro.login_attempts WHERE identifier_hash=${digest(key)}`]);
}
export function failClosed(res,error) {
  // Never reflect credentials, query strings, SQL, or database errors.
  console.error('[KiranaPRO API]', error?.name || 'Error');
  return res.status(503).json({error:'Service temporarily unavailable. Try again later.'});
}
