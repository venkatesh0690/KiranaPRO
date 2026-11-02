import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stores, productsByCategory } from '../src/data/stores.js';
import { getStoreUnder100AddOns } from '../src/utils/cartStoreAddOns.js';

const fresh=stores.find(store=>store.id==='localfresh');
const kirana=stores.find(store=>store.id===2);

test('LocalFresh cart recommendations are real available LocalFresh items under ₹100',()=>{
  const selected=getStoreUnder100AddOns(fresh,productsByCategory,[]);
  assert.ok(selected.length>0,'Expected LocalFresh products under ₹100');
  assert.ok(selected.every(p=>String(p.id).startsWith('lf-')));
  assert.ok(selected.every(p=>Number(p.price)>0 && Number(p.price)<100 && p.inStock!==false));
  const filtered=getStoreUnder100AddOns(fresh,productsByCategory,[{id:selected[0].id}],5);
  assert.ok(!filtered.some(p=>String(p.id)===String(selected[0].id)));
  assert.ok(filtered.length<=5);
});

test('switching the cart to another store switches to that store catalog',()=>{
  const local=getStoreUnder100AddOns(fresh,productsByCategory,[]);
  const other=getStoreUnder100AddOns(kirana,productsByCategory,[]);
  assert.ok(other.length>0);
  assert.ok(other.every(p=>!String(p.id).startsWith('lf-')));
  assert.ok(other.every(p=>kirana.categories.includes(p.category)));
  assert.ok(other.every(p=>Number(p.price)<100));
  assert.ok(!other.some(p=>local.some(l=>String(l.id)===String(p.id))));
});

test('exclude out-of-stock, ₹100+ and other-merchant products',()=>{
  const target={id:'merchant-a',categories:['Pantry']};
  const data={Pantry:[
    {id:'one',name:'Affordable',price:99,inStock:true,storeId:'merchant-a'},
    {id:'high',price:100,storeId:'merchant-a'},
    {id:'sold',price:50,inStock:false,storeId:'merchant-a'},
    {id:'empty',price:20,stock_count:0,storeId:'merchant-a'},
    {id:'foreign',price:10,storeId:'merchant-b'},
    {id:'lf-1004',price:30},
    {id:'blank',price:0}
  ]};
  assert.deepEqual(getStoreUnder100AddOns(target,data,[]).map(p=>p.id),['one']);
  assert.deepEqual(getStoreUnder100AddOns(target,data,[{id:'one'}]),[]);
});

test('cart checkout keeps the compact header area selector and no redundant delivery banner',()=>{
  const code=readFileSync(new URL('../src/pages/CartPage.jsx',import.meta.url),'utf8');
  assert.match(code,/className="cart-top-delivery-area"/);
  assert.match(code,/navigate\('\/location'\)/);
  assert.match(code,/getStoreUnder100AddOns\(store,products,cart\.items\)/);
  assert.match(code,/Under ₹100 products/);
  assert.doesNotMatch(code,/UNDER_25_IMPULSE_ITEMS|Under-₹25 Daily Kitchen Add-Ons|cart-delivery-status-card|cart-delivery-address-card/);
  assert.match(code,/Neighborhood Delivery fee/);
});
