import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const get=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const rls=get('security/rls.sql');
const client=get('src/db/neonClient.js');
const security=get('src/context/SecurityContext.jsx');
const auth=get('api/auth.js');
const api=get('api/_security.js');
const orders=get('api/orders.js');

test('all business and authentication tables force RLS',()=>{
  for(const table of ['stores','products','orders','security_audit_logs','accounts','sessions','login_attempts']){
    assert.match(rls,new RegExp('ALTER TABLE kiranapro\\.'+table+' FORCE ROW LEVEL SECURITY'));
  }
  assert.match(rls,/kp_orders_read/);
  assert.match(rls,/customer_id::text = current_setting\('app.user_id', true\)/);
  assert.match(rls,/store_id = current_setting\('app.store_id', true\)/);
  assert.match(rls,/REVOKE ALL ON ALL TABLES/);
});
test('no browser database password support',()=>{
  assert.doesNotMatch(client,/VITE_(NEON_)?DATABASE_URL|@neondatabase\/serverless|import\.meta\.env/);
  assert.match(client,/\/api\/catalog/);
});
test('no client-side administrator passwords or authoritative local sessions',()=>{
  assert.doesNotMatch(security,/admin123|supersecret|KiranaAdmin@2026|sessionStorage\.setItem\(SESSION_STORAGE_KEY/);
  assert.match(security,/\/api\/auth\?action=/);
  assert.doesNotMatch(get('src/pages/AdminLoginPage.jsx'),/useState\('admin123'\)/);
});
test('authentication uses server-only sessions and rejects self-assigned admin and sellers',()=>{
  assert.match(api,/HttpOnly; SameSite=Strict; Secure/);
  assert.match(api,/timingSafeEqual/);
  assert.match(api,/SELECT set_config\('app.role'/);
  assert.match(auth,/role==='seller'.*approved/);
  assert.match(auth,/process\.env\.ADMIN_PASSWORD_HASH/);
  assert.match(auth,/pendingApproval:true/);
});
test('customer, seller and admin order access is scoped at SQL level',()=>{
  assert.match(orders,/o.customer_id=\$\{session.id\}/);
  assert.match(orders,/o.store_id=\$\{session.storeId\}/);
  assert.match(orders,/\$\{session.role\}='admin'/);
  assert.match(orders,/customer_id,customer_name/);
  assert.doesNotMatch(get('src/context/OrderHistoryContext.jsx'),/localStorage\.getItem/);
  assert.match(get('src/context/StoreContext.jsx'),/fetch\('\/api\/orders'/);
});

test('scoped SQL returns query statement, never role/GUC setup rows',()=>{
  const server=readFileSync(new URL('../api/_security.js',import.meta.url),'utf8');
  assert.match(server,/sql`SET LOCAL ROLE kiranapro_rls_api`/);
  assert.match(server,/sql`SELECT set_config\('app.role'/);
  assert.match(server,/return result\[2\];/);
  assert.doesNotMatch(server,/return result\[1\];/);
});
