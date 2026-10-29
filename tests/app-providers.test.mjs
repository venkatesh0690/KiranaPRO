import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const home=readFileSync(new URL('../src/pages/HomePage.jsx',import.meta.url),'utf8');
const orders=readFileSync(new URL('../src/pages/OrdersPage.jsx',import.meta.url),'utf8');
const cart=readFileSync(new URL('../src/pages/CartPage.jsx',import.meta.url),'utf8');

test('customer order history provider wraps homepage, cart and orders routes',()=>{
  assert.match(app,/import\s*\{\s*OrderHistoryProvider\s*\}\s*from\s*['"]\.\/context\/OrderHistoryContext['"]/);
  const open=app.indexOf('<OrderHistoryProvider>');
  const close=app.indexOf('</OrderHistoryProvider>');
  const shell=app.indexOf('<MainAppShell');
  assert.ok(open>=0 && close>open);
  assert.ok(shell>open && shell<close, 'MainAppShell must render inside OrderHistoryProvider');
  assert.ok(app.indexOf('<SecurityProvider>') < open, 'History provider must be inside security provider');
  assert.ok(app.indexOf('<StoreProvider>')>open && app.indexOf('</StoreProvider>')<close);
});

test('pages using loyalty context are under the protected app shell',()=>{
  assert.match(home,/useCustomerOrders\(/);
  assert.match(orders,/useCustomerOrders\(/);
  assert.match(cart,/useCustomerOrders\(/);
  for (const route of ['/home','/orders','/cart']) {
    assert.ok(app.includes(`path="${route}"`),`missing customer route ${route}`);
  }
});
