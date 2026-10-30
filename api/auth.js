import { randomUUID } from 'node:crypto';
import {
  safeMethod,bodyOf,serviceQuery,hashPassword,checkPassword,validPassword,cleanPhone,validPhone,validEmail,
  createSession,getSession,revokeSession,checkThrottle,failAttempt,clearAttempts,failClosed,publicAccount
} from './_security.js';

export default async function handler(req,res) {
  if (!safeMethod(req,res,['GET','POST'])) return;
  const action = new URL(req.url,'https://kiranapro.invalid').searchParams.get('action');
  try {
    if (req.method === 'GET' && action === 'me') {
      const session=await getSession(req);
      return res.status(200).json({user:session ? publicAccount(session.account) : null});
    }
    if (req.method !== 'POST' || !['login','signup','logout'].includes(action)) {
      return res.status(404).json({error:'Not found'});
    }
    if (action==='logout') {
      await revokeSession(req,res);
      return res.status(200).json({success:true});
    }
    const body=bodyOf(req);
    if (action==='signup') {
      const role=body.role === 'seller' ? 'seller' : 'customer';
      const phone=cleanPhone(body.phone);
      const password=body.password;
      const name=String(body.name || body.ownerName || '').trim();
      if (!validPhone(phone) || !validPassword(password) || name.length<2 || name.length>160) {
        return res.status(400).json({error:'Enter a valid name, mobile number and password of at least 10 characters.'});
      }
      // Both identity types are created server side. Public signup CANNOT assign admin.
      const passwordHash=await hashPassword(password);
      if (role==='customer') {
        const users=await serviceQuery(sql=>[sql`
          INSERT INTO kiranapro.accounts(phone,display_name,password_hash,role,approved)
          VALUES (${phone},${name},${passwordHash},'customer',true)
          ON CONFLICT DO NOTHING RETURNING id,role,phone,display_name,store_id
        `]);
        if (!users.length) return res.status(409).json({error:'Account already exists. Please log in.'});
        const user=await createSession(res,users[0]);
        return res.status(201).json({user});
      }
      const storeName=String(body.storeName || '').trim();
      const category=String(body.category || 'Kirana & Provisions').trim();
      const address=String(body.address || '').trim();
      if (storeName.length<3 || storeName.length>255 || !address || address.length>1000 || category.length>100) {
        return res.status(400).json({error:'Store name, category and address are required.'});
      }
      // Pending registration stays inaccessible until an administrator approves it.
      const storeId='partner-'+randomUUID();
      // Each step is scoped as service. An orphaned inactive store is not a
      // security issue if phone uniqueness causes account registration to fail.
      const existing=await serviceQuery(sql=>[sql`SELECT id FROM kiranapro.accounts WHERE phone=${phone} LIMIT 1`]);
      if (existing.length) return res.status(409).json({error:'Account already exists. Please log in.'});
      await serviceQuery(sql=>[sql`
        INSERT INTO kiranapro.stores(id,name,category,distance_km,delivery_eta,delivery_sla,address,is_active)
        VALUES(${storeId},${storeName},${category},0,'Pending approval','Pending approval',${address},false)
      `]);
      const user=await serviceQuery(sql=>[sql`
        INSERT INTO kiranapro.accounts(phone,display_name,password_hash,role,store_id,approved)
        VALUES(${phone},${name},${passwordHash},'seller',${storeId},false)
        ON CONFLICT DO NOTHING RETURNING id
      `]);
      if (!user.length) return res.status(409).json({error:'Account already exists.'});
      return res.status(202).json({pendingApproval:true,storeId,message:'Application received. An administrator must approve the store before login.'});
    }
    const role=['customer','seller','admin'].includes(body.role)?body.role:null;
    const password=body.password;
    const email=String(body.email||'').trim().toLowerCase();
    const phone=cleanPhone(body.phone);
    if (!role || !password || typeof password!=='string' || password.length>128) {
      return res.status(400).json({error:'Invalid login'});
    }
    const identity=role==='admin' ? email : phone;
    if (role==='admin' ? !validEmail(identity) : !validPhone(identity)) {
      return res.status(400).json({error:'Invalid login'});
    }
    const ip=String(req.headers['x-real-ip']||req.headers['x-forwarded-for']||'unknown').split(',')[0].slice(0,80);
    const throttleKey=`${role}:${identity}:${ip}`;
    if (await checkThrottle(throttleKey)) return res.status(429).json({error:'Too many failed attempts. Try after 15 minutes.'});

    let account;
    if(role==='admin'){
      // No default admin password, no browser-side master keys.
      const adminEmail=String(process.env.ADMIN_EMAIL||'').toLowerCase();
      const adminHash=process.env.ADMIN_PASSWORD_HASH;
      if(adminEmail && adminHash && identity===adminEmail && await checkPassword(password,adminHash)) {
        const known=await serviceQuery(sql=>[sql`SELECT id,role,phone,display_name,store_id,approved FROM kiranapro.accounts WHERE email=${identity} LIMIT 1`]);
        if (known.length && (known[0].role!=='admin' || !known[0].approved)) return res.status(403).json({error:'Admin account conflict'});
        if(known.length) account=known[0];
        else {
          const created=await serviceQuery(sql=>[sql`
            INSERT INTO kiranapro.accounts(email,display_name,password_hash,role,approved)
            VALUES(${identity},'KiranaPRO Administrator',${adminHash},'admin',true)
            ON CONFLICT DO NOTHING RETURNING id,role,phone,display_name,store_id,approved
          `]);
          account=created[0];
        }
      }
    }else{
      const found=await serviceQuery(sql=>[sql`
        SELECT id,role,phone,display_name,password_hash,store_id,approved
        FROM kiranapro.accounts WHERE phone=${identity} AND role=${role} LIMIT 1
      `]);
      if(found.length && await checkPassword(password,found[0].password_hash)) account=found[0];
    }
    if(!account) {
      await failAttempt(throttleKey);
      return res.status(401).json({error:'Invalid credentials'});
    }
    if(account.role==='seller' && !account.approved) {
      return res.status(403).json({error:'Seller account is pending administrator approval'});
    }
    if(role==='seller' && String(body.storeId||'')!==String(account.store_id)) {
      return res.status(403).json({error:'Store access denied'});
    }
    await clearAttempts(throttleKey);
    const user=await createSession(res,account);
    return res.status(200).json({user});
  } catch(error) {
    return failClosed(res,error);
  }
}
