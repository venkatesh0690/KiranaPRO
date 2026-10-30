import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {localFreshProductsList} from '../src/data/localfresh.js';
import {getCatalogVisual} from '../src/utils/catalogVisual.js';
import {getLocalFreshIllustration,LOCALFRESH_IMAGE_MANIFEST} from '../src/utils/localFreshIllustrations.js';
import {selectCatalogPhoto} from '../src/utils/catalogPhotoPriority.js';

test('all uploaded image paths have an existing matching LocalFresh name and category',()=>{
  assert.equal(Object.keys(LOCALFRESH_IMAGE_MANIFEST).length,49);
  for(const [id,[name,category]] of Object.entries(LOCALFRESH_IMAGE_MANIFEST)){
    const actual=localFreshProductsList.find(p=>String(p.id)===id);
    assert.ok(actual,'Missing SKU: '+id);
    assert.equal(actual.name,name,'Wrong image name: '+id);
    assert.equal(actual.category,category,'Wrong image category: '+id);
    const file='/product-images/'+id+'.webp';
    assert.equal(getLocalFreshIllustration(actual),file);
    assert.ok(existsSync(new URL('../public'+file,import.meta.url)),'Missing checked-in asset: '+id);
  }
  assert.equal(getLocalFreshIllustration({id:'lf-1204',name:'Rice Flour',category:'Groceries'}),null);
});
test('reject an illustration if its product name or category no longer matches SKU',()=>{
  const p=localFreshProductsList.find(x=>x.id==='lf-1085');
  assert.ok(p);
  assert.equal(getLocalFreshIllustration({...p,name:'Urad Dal'}),null);
  assert.equal(getLocalFreshIllustration({...p,category:'Vegetables'}),null);
  assert.equal(getLocalFreshIllustration({...p,name:'Amul Toor Dal'}),null);
});
test('uploaded pictures appear even where an older representative photo exists',()=>{
  const watermelon=localFreshProductsList.find(p=>p.id==='lf-1008');
  assert.ok(watermelon);
  const v=getCatalogVisual(watermelon);
  assert.ok(v.photo,'Older representative photo exists for watermelon');
  const selected=selectCatalogPhoto(v,null);
  assert.equal(selected.photo,'/product-images/lf-1008.webp');
  assert.equal(selected.aiIllustration,true);
  assert.equal(selected.srcSet,undefined);
  const sweetlime=localFreshProductsList.find(p=>p.id==='lf-1002');
  assert.equal(selectCatalogPhoto(getCatalogVisual(sweetlime),null).photo,
    '/product-images/lf-1002.webp');
});
test('verified seller photos override illustrations; failed uploaded assets fall back gracefully',()=>{
  const p=localFreshProductsList.find(p=>p.id==='lf-1008');
  const visual=getCatalogVisual({...p,
    verifiedImageUrl:'https://example.com/seller-photo.webp',
    imageSourceUrl:'https://example.com/provenance'
  });
  assert.equal(selectCatalogPhoto(visual,null).photo,'https://example.com/seller-photo.webp');
  assert.equal(selectCatalogPhoto(visual,null).aiIllustration,false);
  const curated=getCatalogVisual(p);
  const asset='/product-images/lf-1008.webp';
  assert.equal(selectCatalogPhoto(curated,null,[asset]).photo,curated.photo);
  assert.equal(selectCatalogPhoto({illustrativePhoto:asset},null,[asset]).photo,null);
  const discovered={photo:'https://upload.wikimedia.org/wikipedia/x.jpg',match:'representative'};
  assert.equal(selectCatalogPhoto({},discovered).photo,discovered.photo);
});
test('product-card image code uses shared photo priority and honest AI labeling',()=>{
  const source=readFileSync(new URL('../src/components/CatalogProductVisual.jsx',import.meta.url),'utf8');
  assert.match(source,/selectCatalogPhoto\(visual,resolvedRemote,failedUrls\)/);
  assert.match(source,/srcSet=\{selected.srcSet\}/);
  assert.match(source,/AI illustration/);
  assert.match(source,/onError=\{\(\)=>setFailedUrls/);
});
