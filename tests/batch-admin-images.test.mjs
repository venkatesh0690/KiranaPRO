import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {aiImageEligible} from '../src/utils/aiImagePolicy.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('administrator onboarding uses expiring single-use server hash, not a demo password',()=>{
  const route=read('api/admin-setup.js');
  const auth=read('api/auth.js');
  const login=read('src/pages/AdminLoginPage.jsx');
  assert.match(route,/timingSafeEqual/);
  assert.match(route,/ADMIN_BOOTSTRAP_TOKEN_HASH/);
  assert.match(route,/ADMIN_BOOTSTRAP_EXPIRES_AT/);
  assert.match(route,/INSERT INTO kiranapro.admin_setup_claims/);
  assert.match(route,/ON CONFLICT DO NOTHING RETURNING token_hash/);
  assert.match(route,/password\.length<16/);
  assert.match(auth,/FROM kiranapro.accounts WHERE email=/);
  assert.match(auth,/checkPassword\(password,found\[0\]\.password_hash\)/);
  assert.match(login,/handleAdminSetup/);
  assert.match(login,/Set up administrator account/);
  assert.doesNotMatch(login,/admin123/);
});
test('admin setup claims are protected by forced RLS and server-only writes',()=>{
  const migration=read('security/admin_setup.sql');
  assert.match(migration,/FORCE ROW LEVEL SECURITY/);
  assert.match(migration,/current_setting\('app.role',true\)='service'/);
});
test('bulk generator requires verified admin and enforces a daily budget',()=>{
  const batch=read('api/catalog-ai-batch.js');
  const generator=read('api/catalog-ai.js');
  assert.match(batch,/requireUser\(req,res,\['admin'\]\)/);
  assert.match(batch,/getCatalogVisual\(p\)\.photo/);
  assert.match(batch,/aiImageEligible\(p.name,p.category\)/);
  assert.match(generator,/requireUser\(req,res,\['admin'\]\)/);
  assert.match(generator,/DATE_TRUNC\('day',NOW\(\)\)/);
  assert.match(generator,/>=36/);
  assert.match(generator,/getCatalogVisual\(item\)\.photo/);
});
test('batch UI is bound to server catalog, limited per run, and lets user stop',()=>{
  const source=read('src/pages/AdminDashboard.jsx');
  assert.match(source,/Generate Missing Images/);
  assert.match(source,/aiBatchSize/);
  assert.match(source,/value=\{24\}/);
  assert.match(source,/aiStopRef\.current=true/);
  assert.match(source,/\/api\/catalog-ai-batch/);
  assert.match(source,/await requestAiImage\(product\)/);
});
test('branded products display nonphotographic placeholders, not fake generic photos',()=>{
  for(const product of ['Amul Butter','Maggi Masala Noodles','Britannia Good Day','Surf Excel']){
    assert.equal(aiImageEligible(product,'Groceries'),false);
  }
  const ui=read('src/components/CatalogProductVisual.jsx');
  assert.match(ui,/kp-catalog-placeholder-drawing/);
  assert.match(ui,/Verified product photo pending/);
  const resolver=read('api/catalog-photo.js');
  assert.match(resolver,/if\(!aiImageEligible\(name,category\)\)/);
  assert.doesNotMatch(ui,/visual\.emoji/);
});
