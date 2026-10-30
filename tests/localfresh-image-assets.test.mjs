import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {localFreshProductsList} from '../src/data/localfresh.js';
import {getLocalFreshIllustration,LOCALFRESH_ILLUSTRATION_COUNT} from '../src/utils/localFreshIllustrations.js';
import {getCatalogVisual} from '../src/utils/catalogVisual.js';

test('all approved LocalFresh AI illustrations are real checked-in WebP assets',()=>{
  const assets=readdirSync(new URL('../public/product-images/',import.meta.url))
    .filter(name=>name.endsWith('.webp'));
  assert.equal(LOCALFRESH_ILLUSTRATION_COUNT,49);
  assert.equal(assets.length,49);
  const ids=new Set(localFreshProductsList.map(p=>String(p.id)));
  for(const name of assets){
    const id=name.replace(/\.webp$/,'');
    assert.ok(ids.has(id),'No catalog SKU for '+name);
    const product=localFreshProductsList.find(p=>String(p.id)===id);
    assert.equal(getLocalFreshIllustration(product),'/product-images/'+name);
    const bytes=readFileSync(new URL('../public/product-images/'+name,import.meta.url));
    assert.ok(bytes.length>1000&&bytes.length<1000000,'Bad asset size '+name);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
  assert.ok(!assets.includes('1204.webp'),'Unidentified product image must not be auto-published');
});

test('illustrative product assets do not override verified or curated real photos',()=>{
  const photo=localFreshProductsList.find(p=>p.name==='Water Melon');
  assert.ok(photo);
  const visual=getCatalogVisual(photo);
  assert.ok(visual.illustrativePhoto,'Generated fallback should remain ready');
  assert.ok(visual.photo,'Curated real photo must retain priority');
  const packaged=getLocalFreshIllustration({
    id:'lf-1099',name:'Amul Butter',category:'Groceries'
  });
  assert.equal(packaged,null,'Do not apply a generic illustrated SKU to a branded product');
});
