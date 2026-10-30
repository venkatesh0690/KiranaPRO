import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {aiImageEligible,aiImagePrompt,normalizeItem} from '../src/utils/aiImagePolicy.js';
import {imageKey,isPublicBlobUrl} from '../api/catalog-ai.js';
const src=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('generic Indian groceries are eligible for accurate representative AI images',()=>{
  for(const [name,category] of [
    ['Gongura Pickle 500 gms','Pickles'],['Fresh Coriander','Leafy Green'],
    ['Potols','Vegetables'],['Guava','Fruits'],['Toor Dal','Groceries'],
    ['Ash Gourd','Vegetables'],['Marigold','Flowers'],['Rice','Household Staples']
  ]){
    assert.equal(aiImageEligible(name,category),true,name);
    const prompt=aiImagePrompt(name,category);
    assert.match(prompt,/No text, logos, trademarks/);
    assert.match(prompt,/pale warm neutral background/);
  }
});
test('branded packs, medicines and baby products are never AI-synthesized',()=>{
  for(const [name,category] of [
    ['Amul Butter','Dairy'],['Maggi 2-Minute Noodles','Groceries'],
    ['Britannia Good Day','Snacks'],['Surf Excel','Household'],
    ['Pampers Diapers','Baby Care'],['Vitamin Capsules','Groceries'],
    ['Coca-Cola','Drinks'],['Priya Mango Pickle','Pickles']
  ]) {
    assert.equal(aiImageEligible(name,category),false,name);
    assert.equal(aiImagePrompt(name,category),null);
  }
});
test('normalizing product names deduplicates images without mixing categories',()=>{
  assert.equal(normalizeItem('  Ash-Gourd  '),normalizeItem('Ash Gourd'));
  assert.equal(imageKey('Ash-Gourd','Vegetables'),imageKey('ash gourd','Vegetables'));
  assert.notEqual(imageKey('Coriander','Vegetables'),imageKey('Coriander','Spices'));
  assert.equal(imageKey('Coriander','Vegetables').length,64);
});
test('only published Vercel Blob URLs qualify as persisted AI illustrations',()=>{
  assert.equal(isPublicBlobUrl('https://abcd.public.blob.vercel-storage.com/catalog/x.webp'),true);
  for(const url of [
    'https://example.com/image.webp','javascript:alert(1)',
    'https://abcd.public.blob.vercel-storage.com.evil.example/x.webp',
    'https://abcd.private.blob.vercel-storage.com/x.webp'
  ]) assert.equal(isPublicBlobUrl(url),false,url);
});
test('generation requires admin session and existing DB product, never browser prompt',()=>{
  const code=src('api/catalog-ai.js');
  assert.match(code,/requireUser\(req,res,\['admin'\]\)/);
  assert.match(code,/kiranapro\.products WHERE store_id=/);
  assert.doesNotMatch(code,/data\.prompt|req\.body\.prompt/);
  assert.match(code,/ON CONFLICT\(image_key\)/);
  assert.match(code,/retry_after=NOW\(\)\+INTERVAL '1 hour'/);
  assert.match(code,/OPENAI_API_KEY/);
  assert.match(code,/BLOB_READ_WRITE_TOKEN/);
});
test('public SQL policy reads published images only; writes require server role',()=>{
  const sql=src('security/catalog_ai_images.sql');
  assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
  assert.match(sql,/FORCE ROW LEVEL SECURITY/);
  assert.match(sql,/status='ready' OR current_setting/);
  assert.match(sql,/FOR INSERT WITH CHECK \(current_setting\('app.role',true\)='service'\)/);
});
test('client distinguishes AI art, real photos and unavailable photos',()=>{
  const component=src('src/components/CatalogProductVisual.jsx');
  const search=src('src/utils/catalogPhotoClient.js');
  assert.match(component,/AI illustration/);
  assert.match(component,/aiIllustration/);
  assert.match(search,/\.public\.blob\.vercel-storage\.com/);
  assert.match(src('api/catalog-photo.js'),/if\(!real\.photo\)/);
  assert.match(src('index.html'),/\*\.public\.blob\.vercel-storage\.com/);
  assert.match(src('src/pages/AdminDashboard.jsx'),/Generate and save image/);
});
