import {randomUUID} from 'node:crypto';
import {safeMethod,bodyOf,requireUser,currentQuery,failClosed} from './_security.js';

export default async function handler(req,res) {
  if(!safeMethod(req,res,['GET','POST','PATCH'])) return;
  try{
    const params=new URL(req.url,'https://kiranapro.invalid').searchParams;
    const storeId=String(params.get('storeId') || '');
    if(req.method==='GET'){
      const sqlIdentity={role:''};
      if(storeId){
        if(!/^[a-zA-Z0-9-]{1,64}$/.test(storeId)) return res.status(400).json({error:'Invalid store'});
        const rows=await currentQuery(sqlIdentity,sql=>[sql`
          SELECT p.id,p.store_id,p.name,p.original_price,p.price,p.unit,p.category,
                 p.discount_badge,p.in_stock,p.image_url
          FROM kiranapro.products p JOIN kiranapro.stores s ON s.id=p.store_id
          WHERE p.store_id=${storeId} AND s.is_active=true
          ORDER BY p.category,p.name LIMIT 500
        `]);
        return res.status(200).json({products:rows});
      }
      const rows=await currentQuery(sqlIdentity,sql=>[sql`
        SELECT id,name,category,rating,rating_count,distance_km,delivery_eta,delivery_sla,
               min_order,address,image_url,is_active
        FROM kiranapro.stores WHERE is_active=true ORDER BY name LIMIT 200
      `]);
      return res.status(200).json({stores:rows});
    }
    const session=await requireUser(req,res,['seller','admin']);
    if(!session) return;
    const data=bodyOf(req);
    const ownedStore=session.role==='seller' ? String(session.storeId||'') : String(data.storeId||'');
    if(!/^[a-zA-Z0-9-]{1,64}$/.test(ownedStore) ||
       (session.role==='seller' && data.storeId && data.storeId!==ownedStore)) {
      return res.status(403).json({error:'Store access denied'});
    }
    if(req.method==='PATCH' && data.action==='store-status'){
      if(typeof data.isActive!=='boolean') return res.status(400).json({error:'Invalid store status'});
      const rows=await currentQuery(session,sql=>[sql`
        UPDATE kiranapro.stores SET is_active=${data.isActive},updated_at=NOW()
        WHERE id=${ownedStore} RETURNING id,is_active
      `]);
      return rows.length?res.status(200).json({store:rows[0]}):res.status(404).json({error:'Store not found'});
    }
    if(req.method==='PATCH'){
      const productId=String(data.productId||'');
      if(!/^[a-zA-Z0-9-]{1,64}$/.test(productId)) return res.status(400).json({error:'Invalid product'});
      if(data.inStock===undefined && data.price===undefined) return res.status(400).json({error:'No changes'});
      const price=Number(data.price);
      if(data.price!==undefined && (!Number.isFinite(price) || price<=0 || price>100000))
        return res.status(400).json({error:'Invalid price'});
      const rows=await currentQuery(session,sql=>[sql`
        UPDATE kiranapro.products SET
          in_stock=CASE WHEN ${data.inStock===undefined} THEN in_stock ELSE ${Boolean(data.inStock)} END,
          price=CASE WHEN ${data.price===undefined} THEN price ELSE ${Number.isFinite(price)?price:0} END,
          updated_at=NOW()
        WHERE id=${productId} AND store_id=${ownedStore}
        RETURNING id,store_id,price,in_stock
      `]);
      return rows.length?res.status(200).json({product:rows[0]}):res.status(404).json({error:'Product not found'});
    }
    const name=String(data.name||'').trim();
    const category=String(data.category||'').trim();
    const unit=String(data.unit||'').trim();
    const price=Number(data.price);
    if(!name || name.length>255 || !category || category.length>100 || !unit || unit.length>50 ||
       !Number.isFinite(price) || price<=0 || price>100000)
      return res.status(400).json({error:'Invalid product fields'});
    const id='item-'+randomUUID();
    const rows=await currentQuery(session,sql=>[sql`
      INSERT INTO kiranapro.products(id,store_id,name,category,unit,price,original_price,in_stock)
      VALUES(${id},${ownedStore},${name},${category},${unit},${price},${price},true)
      RETURNING id,store_id,name,category,unit,price
    `]);
    return res.status(201).json({product:rows[0]});
  }catch(error){return failClosed(res,error);}
}
