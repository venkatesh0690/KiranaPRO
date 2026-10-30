import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('area selection waits for parent-confirmed location before navigating',()=>{
  const page=read('src/pages/LocationPage.jsx');
  assert.match(page,/setPendingArea\(selectedArea\);\s*onLocationSet\(selectedArea\);/);
  assert.match(page,/initialLocation===pendingArea/);
  assert.match(page,/navigate\('\/home',\{replace:true\}\)/);
  assert.match(page,/disabled=\{!selectedArea \|\| Boolean\(pendingArea\)\}/);
});

test('guest mode cannot be overridden by a late server session hydration response',()=>{
  const security=read('src/context/SecurityContext.jsx');
  assert.match(security,/previous\.isAuthenticated \? previous : data\.user/);
  assert.match(security,/isTemporary:true/);
});

test('lazy route errors and long loads have accessible recovery controls',()=>{
  const app=read('src/App.jsx');
  assert.match(app,/class RouteRecoveryBoundary extends Component/);
  assert.match(app,/<RouteRecoveryBoundary key=\{location\.pathname\}>/);
  assert.match(app,/>Reload KiranaPRO</);
  assert.match(app,/>Retry loading</);
  assert.match(app,/<Suspense fallback=\{<RouteLoading \/>\}>/);
});

test('fresh HTML / SW rotation and actual banner and product photo hosts',()=>{
  const sw=read('public/sw.js');
  assert.match(sw,/VERSION='kiranapro-fast-v4'/);
  assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)\)return/);
  const html=read('index.html');
  assert.match(html,/img-src [^"]*https:\/\/unsplash\.com/);
  assert.match(html,/img-src [^"]*https:\/\/upload\.wikimedia\.org/);
  const vercel=JSON.parse(read('vercel.json'));
  assert.ok(vercel.headers.some(h=>h.source==='/' &&
    h.headers.some(item=>item.key==='Cache-Control'&&item.value.includes('no-store'))));
});
