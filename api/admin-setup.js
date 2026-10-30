import {createHash,timingSafeEqual} from 'node:crypto';
import {safeMethod,bodyOf,serviceQuery,hashPassword,validEmail,failClosed} from './_security.js';

const keyName='ADMIN_BOOTSTRAP_TOKEN_HASH';
const hash=value=>createHash('sha256').update(value).digest('hex');
function validSetup(){
  const expires=Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT||'');
  return /^[a-f0-9]{64}$/.test(process.env[keyName]||'') &&
    Number.isFinite(expires) && expires>Date.now();
}
export default async function handler(req,res){
  if(!safeMethod(req,res,['GET','POST']))return;
  try{
    const admins=await serviceQuery(sql=>[sql`SELECT id FROM kiranapro.accounts WHERE role='admin' AND approved=true LIMIT 1`]);
    if(req.method==='GET'){
      return res.status(200).json({
        setupAvailable:validSetup() && admins.length===0,
        configuration:{
          hashFormatValid:/^[a-f0-9]{64}$/.test(process.env[keyName]||''),
          expiryValid:Number.isFinite(Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT||'')) &&
            Date.parse(process.env.ADMIN_BOOTSTRAP_EXPIRES_AT||'')>Date.now(),
          adminAccountExists:admins.length>0
        }
      });
    }
    // Fail closed when an administrator already exists or the setup link expires.
    if(!validSetup()||admins.length) return res.status(403).json({error:'Administrator setup is unavailable.'});
    const body=bodyOf(req);
    const email=String(body.email||'').trim().toLowerCase();
    const displayName=String(body.name||'KiranaPRO Administrator').trim();
    const password=body.password;
    const token=String(body.setupToken||'');
    if(!validEmail(email) || displayName.length<2 || displayName.length>100 ||
       typeof password!=='string' || password.length<16 || password.length>128 ||
       !/[a-z]/.test(password) || !/[A-Z]/.test(password) ||
       !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password) ||
       !/^[a-f0-9]{48}$/.test(token))
      return res.status(400).json({error:'Use a valid email, 16+ character strong password and setup code.'});
    const submitted=Buffer.from(hash(token),'hex');
    const expected=Buffer.from(process.env[keyName],'hex');
    if(!timingSafeEqual(submitted,expected))return res.status(403).json({error:'Invalid setup code.'});
    // Ensure the one-time setup code cannot be used concurrently for
    // multiple administrators. Repeated requests always fail closed.
    const claimed=await serviceQuery(sql=>[sql`
      INSERT INTO kiranapro.admin_setup_claims(token_hash)
      VALUES (${process.env[keyName]}) ON CONFLICT DO NOTHING RETURNING token_hash
    `]);
    if(!claimed.length)return res.status(409).json({error:'Setup code already used.'});
    const passwordHash=await hashPassword(password);
    const created=await serviceQuery(sql=>[sql`
      INSERT INTO kiranapro.accounts(email,display_name,password_hash,role,approved)
      VALUES (${email},${displayName},${passwordHash},'admin',true)
      ON CONFLICT DO NOTHING RETURNING id
    `]);
    if(!created.length)return res.status(409).json({error:'Account already registered. Contact platform operator.'});
    return res.status(201).json({success:true,message:'Administrator account created. Sign in with your email and password.'});
  }catch(error){return failClosed(res,error);}
}
