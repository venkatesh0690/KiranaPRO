import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { localFreshProductsList } from '../src/data/localfresh.js';
import { productsByCategory } from '../src/data/stores.js';
import { getPhotoQueries, scoreCommonsPhoto } from '../src/utils/productPhotoSearch.js';
import { resolvePhoto } from '../api/catalog-photo.js';
const all=[...Object.values(productsByCategory).flat(),...localFreshProductsList];
const unique=new Map(all.map(p=>[String(p.id),p]));

test('every catalog product has a distinct, usable real-photo search identity',()=>{
  assert.ok(unique.size>=150);
  for(const product of unique.values()){
    const q=getPhotoQueries(product);
    assert.ok(q.primary.length>=3,'Missing photo subject for '+product.name);
    assert.ok(q.primary.length<=100);
    assert.ok(q.fallback.length>=3);
    assert.ok(!/emoji|icon|illustration/i.test(q.primary));
  }
});
test('regional produce and packaged product queries are differentiated',()=>{
  const examples=[
    ['Potols','pointed gourd'],
    ['Yellow Cucumber Dosakaya','dosakaya'],
    ['Bachali Kura','malabar spinach'],
    ['Gongura Pickle 500 gms','gongura'],
    ['Fresh Jasmine String (Madurai Malli / Mallepoolu)','jasmine'],
    ['Amul Taaza Homogenised Toned Milk','milk carton'],
    ["Haldiram's Nagpur Aloo Bhujia",'bhujia'],
    ['Pampers All Round Protection Pants (M)','diaper']
  ];
  for (const [name,term] of examples) {
    assert.ok(getPhotoQueries({name}).primary.toLowerCase().includes(term),
      name+' lacks a meaningful Commons photo search');
  }
});
const img=(title,mime='image/jpeg')=>({
  title:'File:'+title,
  imageinfo:[{mime,width:900,height:650,thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/test/240px-photo.jpg'}]
});
test('Commons selection is a real photograph and rejects logos/icons',async()=>{
  const answer=await resolvePhoto({name:'Potols'},async()=>
    [img('Pointed gourd vegetable pods.jpg'),img('Pointed gourd logo.jpg'),
     img('Pointed gourd illustration.svg','image/svg+xml')]);
  assert.ok(answer.photo?.startsWith('https://upload.wikimedia.org'));
  assert.ok(answer.sourceUrl.includes('File:'));
  assert.match(answer.title,/Pointed gourd vegetable pods/);
});
test('incorrect or synthetic imagery is not accepted',async()=>{
  const answer=await resolvePhoto({name:'Ginger'},async()=>[img('Ginger cartoon icon.png'),
    img('Pumpkin photograph.jpg')]);
  assert.equal(answer.photo,null);
});
test('UI always requests real images on demand and never renders emoji as product art',()=>{
  const component=readFileSync(new URL('../src/components/CatalogProductVisual.jsx',import.meta.url),'utf8');
  const src=readFileSync(new URL('../src/utils/catalogPhotoClient.js',import.meta.url),'utf8');
  const config=JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));
  assert.match(component,/discoverProductPhoto/);
  assert.doesNotMatch(component,/kp-catalog-emoji|visual\.emoji/);
  assert.match(component,/IntersectionObserver/);
  assert.match(component,/loading="|loading=\{/);
  assert.match(src,/MAX_ACTIVE=2/);
  assert.ok(config.rewrites.some(r=>r.source==='/api/(.*)'));
});
