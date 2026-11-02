import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stores, productsByCategory} from '../src/data/stores.js';
import {DELIVERY_AREAS,getStoresForArea} from '../src/data/deliveryAreas.js';
import {navigateWithStoreTransition} from '../src/utils/storeTransition.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('every advertised store belongs to a valid area and has displayable products',()=>{
  for(const area of DELIVERY_AREAS){
    const candidates=getStoresForArea(stores,area);
    assert.ok(candidates.length>=2,area+' should have store options');
    for(const store of candidates){
      assert.ok(store.id!==undefined&&store.name,area+' store identity');
      assert.ok(Array.isArray(store.categories)&&store.categories.length,store.name+' categories');
      const count=store.categories.reduce((n,cat)=>n+(productsByCategory[cat]||[]).length,0);
      assert.ok(count>0,store.name+' should have matching catalog items');
    }
  }
});

test('store link navigation cannot wait for a cancelable animation timer',()=>{
  const storeCard=read('src/components/StoreCard.jsx');
  assert.match(storeCard,/<Link[\s\S]*?to=\{\`\/store\/\$\{store\.id\}\`\}/);
  assert.doesNotMatch(storeCard,/pending\.current|setOpening\(|navigateWithStoreTransition\(/);
  assert.doesNotMatch(storeCard,/setTimeout\(/);
});

test('all store-entry points navigate immediately without flushSync transitions',()=>{
  let opened=null;
  navigateWithStoreTransition(path=>{opened=path;},'/store/localfresh');
  assert.equal(opened,'/store/localfresh');
  const util=read('src/utils/storeTransition.js');
  assert.doesNotMatch(util,/flushSync|startViewTransition\(/);
  const app=read('src/App.jsx');
  assert.match(app,/path="\/store\/:id"/);
});
