import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const endpoint=source('api/security-status.js');
const dashboard=source('src/pages/AdminDashboard.jsx');
const session=source('src/context/SecurityContext.jsx');
const protectedRoutes=source('src/components/ProtectedRoutes.jsx');

test('database diagnostics requires an authenticated administrator',()=>{
  assert.match(endpoint,/requireUser\(req,res,\['admin'\]\)/);
  assert.match(endpoint,/safeMethod\(req,res,\['GET'\]\)/);
  assert.match(endpoint,/currentQuery\(admin/);
  assert.match(endpoint,/relforcerowsecurity/);
  assert.match(endpoint,/rolbypassrls/);
  assert.match(endpoint,/rolcanlogin/);
  assert.doesNotMatch(endpoint,/process\.env\.DATABASE_URL\s*[,}]/);
});

test('admin dashboard runs actual server checks, not a simulated passing scan',()=>{
  assert.match(dashboard,/fetch\('\/api\/security-status'/);
  assert.doesNotMatch(dashboard,/100% SECURE & HEALTHY/);
  assert.doesNotMatch(dashboard,/0 Vulnerabilities Detected/);
  assert.doesNotMatch(dashboard,/CSP active/);
  assert.doesNotMatch(dashboard,/42 ms.*Primary pool healthy/);
  assert.match(dashboard,/Browser Session Activity \(Not a Server Audit Trail\)/);
});

test('client activity is never passed off as server IP evidence or token data',()=>{
  assert.doesNotMatch(session,/127\.0\.0\.1 \(Local Verified\)/);
  assert.doesNotMatch(session,/SECURITY_SHIELD_INITIALIZED/);
  assert.doesNotMatch(protectedRoutes,/authSession\.token\?\.slice/);
  assert.doesNotMatch(protectedRoutes,/Super Admin Terminal: <strong>admin@kiranapro\.com/);
});
