// Explicit one-time bootstrap of only the admin-managed LocalFresh catalog.
// No fictional/sample neighborhood stores are imported into the live database.
// Requires a trusted server/CLI role and KIRANAPRO_SEED_CONFIRM=localfresh-only.
import {neon} from '@neondatabase/serverless';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

if(process.env.KIRANAPRO_SEED_CONFIRM!=='localfresh-only'){
  throw new Error('Set KIRANAPRO_SEED_CONFIRM=localfresh-only explicitly.');
}
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL must be available server-side.');
const sql=neon(process.env.DATABASE_URL);
const items=JSON.parse(readFileSync(new URL('../localfresh_final.json',import.meta.url),'utf8'));
if(!Array.isArray(items)||items.length<100)throw new Error('LocalFresh catalog is incomplete.');
await sql`
  INSERT INTO kiranapro.stores(id,name,category,rating,rating_count,distance_km,
    delivery_eta,delivery_sla,min_order,address,is_active)
  VALUES('localfresh','LocalFresh','Vegetables, Fruits & Grocery',4.9,684,0.2,
    'Within 2 hours','Direct Mandi',49,
    'KiranaPRO Central Direct Mandi Hub, MVP Colony, Vizag',true)
  ON CONFLICT(id) DO NOTHING
`;
let inserted=0;
for(const p of items){
  const id=String(p.id||'');
  const price=Number(p.price);
  const mrp=Number(p.mrp||price);
  if(!/^lf-[a-z0-9-]{2,32}$/.test(id)||!p.name||!Number.isFinite(price)||price<=0){
    throw new Error('Invalid LocalFresh catalog data');
  }
  // Preserve daily merchant price changes on subsequent seed runs.
  const result=await sql`
    INSERT INTO kiranapro.products(id,store_id,name,original_price,price,unit,
      category,discount_badge,in_stock,image_url)
    VALUES(${id},'localfresh',${String(p.name)},${mrp},${price},${String(p.unit||'1 pc')},
      ${String(p.category||'Fresh Produce')},${String(p.badge||'')},
      ${p.inStock!==false},'')
    ON CONFLICT(id) DO NOTHING RETURNING id
  `;
  inserted+=result.length;
}
const totals=await sql`
  SELECT count(*)::int AS total FROM kiranapro.products WHERE store_id='localfresh'
`;
console.log('LocalFresh catalog items:',totals[0].total,'new:',inserted);
