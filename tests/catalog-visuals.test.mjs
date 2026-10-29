import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productsByCategory } from '../src/data/stores.js';
import { localFreshProductsList, localFreshProductsByCategory } from '../src/data/localfresh.js';
import { getCatalogVisual } from '../src/utils/catalogVisual.js';

const products=[...Object.values(productsByCategory).flat(),...localFreshProductsList];
const unique=new Map(products.map(p=>[String(p.id),p]));

test('all grocery SKUs have relevant, name-labelled, low-cost visuals',()=>{
  assert.ok(unique.size>=140, 'Unexpectedly missing catalog records');
  const generic=[];
  for (const product of unique.values()) {
    const visual=getCatalogVisual(product);
    assert.equal(typeof visual.label,'string');
    assert.ok(visual.label.length>0,`No label for ${product.name}`);
    assert.ok(visual.emoji,`No fall-back art for ${product.name}`);
    if(visual.emoji==='🛒')generic.push(product.name);
    if(visual.photo) {
      assert.ok(/^https:\/\/(images\.unsplash\.com|commons\.wikimedia\.org)\//.test(visual.photo));
      assert.match(visual.photo,/(w=160|width=160)/);
      assert.ok(visual.photoSrcSet?.includes('320w'));
      if(visual.photo.includes('images.unsplash.com')) assert.match(visual.photo,/q=42&fm=webp/);
    }
    assert.ok(!product.image || !String(product.image).startsWith('http'),
      `Unreviewed image URL persists for ${product.name}`);
  }
  assert.deepEqual(generic,[],`Unidentified products still use generic shopping cart art`);
});
test('do not show a raw commodity photograph as the product packaging',()=>{
  for (const name of [
    'Priya Andhra Avakaya (Mango) Pickle',
    'Tata Sampann High-Protein Toor Dal',
    'Maggi 2-Minute Masala Instant Noodles',
    'Gongura Pickle 500 gms',
    'Fresh Jasmine String (Madurai Malli / Mallepoolu)',
    'Amul Fresh Malai Paneer'
  ]) {
    const result=getCatalogVisual({name,category:'Groceries'});
    assert.equal(result.photo,null,`Misleading photo assigned: ${name}`);
  }
});
test('specific fresh produce photographs are not misleading generic product shots',()=>{
  for (const name of ['Ash Gourd','Potols','Lady Finger / Bhindi','Bottle Gourd','Beerakaya','Ivy gourd','Coriander','Chana dal','Guava','Avocado','Pomegranate','Red Dragon Fruit','Cluster Beans','Drumsticks']) {
    const visual=getCatalogVisual({name,category:'Vegetables'});
    assert.ok(visual.photo,`No verified photo for ${name}`);
    assert.ok(visual.photo.includes('wikimedia.org'));
  }
  const branded=getCatalogVisual({name:'Britannia Good Day Butter Cookies',category:'Snacks'});
  assert.equal(branded.photo,null);
});
test('each LocalFresh category retains its full catalog',()=>{
  const fromCategories=Object.values(localFreshProductsByCategory).flat();
  assert.ok(fromCategories.length>=100);
  assert.ok(localFreshProductsList.length>=100);
});
test('product surfaces use the central optimized visual component',()=>{
  for (const file of [
    'src/components/ProductCard.jsx',
    'src/components/ProductDetailModal.jsx',
    'src/pages/CartPage.jsx',
    'src/pages/AdminDashboard.jsx',
    'src/pages/SellerDashboard.jsx'
  ]) {
    const text=readFileSync(new URL('../'+file,import.meta.url),'utf8');
    assert.match(text,/CatalogProductVisual/,`Missing shared product visual in ${file}`);
  }
});

test('small picture requests and exact branded identity are enforced',()=>{
  for(const name of ['Tomato','Potato','Apple','Banana','Watermelon','Cabbage']) {
    const v=getCatalogVisual({name});
    assert.ok(v.photo,'Expected compact produce photo for '+name);
    assert.match(v.photo,/(w=160|width=160)/);
    assert.match(v.photoSrcSet,/320w/);
  }
  for(const name of ['Amul Salted Butter','Saffola Gold Pro Healthy Heart Oil',
   'Surf Excel Easy Wash Detergent Powder','Britannia Good Day Butter Cookies']) {
    const v=getCatalogVisual({name});
    assert.equal(v.photo,null,'Wrong package photo for '+name);
    assert.ok(v.emoji);
  }
});
