import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {toCatalogSearchItems} from '../src/utils/catalogSearchIndex.js';
import {productsByCategory} from '../src/data/stores.js';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('KiranaPRO grouped store catalog normalizes to a searchable array without crashing',()=>{
  const result=toCatalogSearchItems(productsByCategory);
  assert.ok(Array.isArray(result));
  assert.ok(result.length>50);
  assert.ok(result.every(x=>typeof x.name==='string' && x.name));
  assert.ok(result.some(x=>String(x.id).startsWith('lf-')));
});
test('global search accepts flat lists, missing data, and irregular category rows',()=>{
  const rice={id:'rice',name:'Rice',category:'Groceries'};
  const dal={id:'dal',name:'Toor Dal',category:'Groceries'};
  assert.deepEqual(toCatalogSearchItems([rice,null,dal]),[rice,dal]);
  assert.deepEqual(toCatalogSearchItems({Groceries:[rice,dal],Empty:null,Broken:{}}),[rice,dal]);
  for(const input of [null,undefined,0,'text',{},[]]){
    assert.deepEqual(toCatalogSearchItems(input),[]);
  }
});
test('CommandSpotlight never calls slice/filter on grouped catalog directly',()=>{
  const source=read('src/components/CommandSpotlight.jsx');
  assert.match(source,/toCatalogSearchItems\(catalog\)/);
  assert.match(source,/catalogItems\.slice\(0, 5\)/);
  assert.match(source,/catalogItems\s*\.filter/);
  assert.doesNotMatch(source,/^\\s*(?:\\?|:)?\\s*catalog\\.slice\\(|^\\s*catalog\\s*\\.filter\\(/m);
});
test('app recovers from render errors and blocked browser storage',()=>{
  const source=read('src/App.jsx');
  assert.match(source,/<RouteRecoveryBoundary>[\s\S]*?<MainAppShell/);
  assert.match(source,/const saved = localStorage\.getItem\('kp_user_location'\)/);
  assert.match(source,/catch \{ \/\* Continue without browser storage\. \*\/ \}/);
});
