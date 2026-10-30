import { randomUUID } from 'node:crypto';
import {safeMethod,bodyOf,requireUser,currentQuery,failClosed} from './_security.js';

function formatOrder(r) {
  return {
    id:r.id,storeId:r.store_id,customerName:r.customer_name,
    customerPhone:r.customer_phone,customerAddress:r.delivery_address,
    items:r.items || [],subtotal:Number(r.subtotal),deliveryFee:Number(r.delivery_fee),
    discount:Number(r.discount),total:Number(r.total),status:r.status,
    paymentMethod:r.payment_method,placedAt:r.created_at,orderTime:r.created_at,
    storeName:r.store_name || r.store_id,storeArea:r.delivery_address,handlingFee:5,tax:0,
    fulfilment:{mode:'standard'},riderName:'Courier partner',eta:'Pending',
    totalAmount:Number(r.total)
  };
}
const FIELDS=`o.id,o.store_id,o.customer_name,o.customer_phone,o.delivery_address,o.items,
    o.subtotal,o.delivery_fee,o.discount,o.total,o.payment_method,o.status,o.created_at,
    s.name AS store_name`;

export default async function handler(req,res) {
  if(!safeMethod(req,res,['GET','POST','PATCH'])) return;
  try{
    const session=await requireUser(req,res,['customer','seller','admin']);
    if(!session) return;
    if(req.method==='GET'){
      // SQL RLS AND explicit owner/tenant filters, never a client-supplied customer ID.
      const rows=await currentQuery(session,sql=>[sql`
        SELECT o.id,o.store_id,o.customer_name,o.customer_phone,o.delivery_address,o.items,
               o.subtotal,o.delivery_fee,o.discount,o.total,o.payment_method,o.status,o.created_at,
               s.name AS store_name
        FROM kiranapro.orders o LEFT JOIN kiranapro.stores s ON s.id=o.store_id
        WHERE (${session.role}='customer' AND o.customer_id=${session.id})
           OR (${session.role}='seller' AND o.store_id=${session.storeId})
           OR (${session.role}='admin')
        ORDER BY o.created_at DESC LIMIT 100
      `]);
      return res.status(200).json({orders:rows.map(formatOrder)});
    }
    const data=bodyOf(req);
    if(req.method==='PATCH'){
      if(!['seller','admin'].includes(session.role)) return res.status(403).json({error:'Access denied'});
      const id=String(data.orderId||'');
      const status=String(data.status||'');
      if(!/^[a-zA-Z0-9-]{1,64}$/.test(id) || !['Received','Preparing','Out for Delivery','Delivered','Cancelled'].includes(status))
        return res.status(400).json({error:'Invalid order/status'});
      const rows=await currentQuery(session,sql=>[sql`
        UPDATE kiranapro.orders SET status=${status}
        WHERE id=${id} AND (${session.role}='admin' OR store_id=${session.storeId})
        RETURNING id,status
      `]);
      return rows.length?res.status(200).json({order:rows[0]}):res.status(404).json({error:'Order not found'});
    }
    if(session.role!=='customer') return res.status(403).json({error:'Customer account required'});
    const storeId=String(data.storeId||'');
    const address=String(data.deliveryAddress||'').trim();
    const raw=Array.isArray(data.items)?data.items:[];
    if(!/^[a-zA-Z0-9-]{1,64}$/.test(storeId) || address.length<8 || address.length>1000 ||
       raw.length<1 || raw.length>50) return res.status(400).json({error:'Invalid checkout details'});
    const requestItems=new Map();
    for(const entry of raw){
      const id=String(entry?.id??'');
      const qty=Number(entry?.qty ?? entry?.quantity);
      if(!/^[a-zA-Z0-9-]{1,64}$/.test(id) || !Number.isInteger(qty) || qty<1 || qty>20 ||
         requestItems.has(id)) return res.status(400).json({error:'Invalid item/quantity'});
      requestItems.set(id,qty);
    }
    const stores=await currentQuery(session,sql=>[sql`
      SELECT id,name FROM kiranapro.stores WHERE id=${storeId} AND is_active=true
    `]);
    if(!stores.length) return res.status(400).json({error:'Store is unavailable'});
    const products=await currentQuery(session,sql=>[sql`
      SELECT id,name,price,unit,in_stock FROM kiranapro.products WHERE store_id=${storeId}
    `]);
    const available=new Map(products.map(p=>[String(p.id),p]));
    const items=[];
    let subtotal=0;
    for(const [id,qty] of requestItems){
      const p=available.get(id);
      if(!p || !p.in_stock || Number(p.price)<=0) return res.status(409).json({error:'One or more products are no longer available'});
      const price=Number(p.price);
      subtotal+=price*qty;
      items.push({id,name:p.name,price,qty,unit:p.unit});
    }
    // Never trust browser-submitted amounts, discounts, status or customer_id.
    const deliveryFee=storeId==='localfresh'?20:(subtotal>300?0:20);
    const total=Math.round((subtotal+deliveryFee+5)*100)/100;
    const orderId='KP-'+randomUUID();
    const rows=await currentQuery(session,sql=>[sql`
      INSERT INTO kiranapro.orders(id,store_id,customer_id,customer_name,customer_phone,
        delivery_address,items,subtotal,delivery_fee,discount,total,payment_method,status)
      VALUES(${orderId},${storeId},${session.id},${session.account.display_name},${session.account.phone||''},
        ${address},${JSON.stringify(items)}::jsonb,${subtotal},${deliveryFee},0,${total},'Demo — no payment collected','Placed')
      RETURNING id,created_at,status
    `]);
    return res.status(201).json({order:{
      id:rows[0].id,storeId,storeName:stores[0].name,items,subtotal,deliveryFee,
      discount:0,total,placedAt:rows[0].created_at,status:'Placed',
      fulfilment:{mode:'standard'},handlingFee:5,tax:0,
      paymentMethod:'Demo — no payment collected'
    }});
  }catch(error){return failClosed(res,error)}
}
