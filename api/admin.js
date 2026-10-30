import {safeMethod,bodyOf,requireUser,currentQuery,failClosed} from './_security.js';

export default async function handler(req,res) {
  if(!safeMethod(req,res,['GET','POST'])) return;
  try{
    const admin=await requireUser(req,res,['admin']);
    if(!admin) return;
    if(req.method==='GET'){
      const rows=await currentQuery(admin,sql=>[sql`
        SELECT a.id,a.display_name,a.phone,a.store_id,s.name AS store_name,s.address,a.created_at
        FROM kiranapro.accounts a JOIN kiranapro.stores s ON s.id=a.store_id
        WHERE a.role='seller' AND a.approved=false ORDER BY a.created_at LIMIT 100
      `]);
      return res.status(200).json({pending:rows});
    }
    const data=bodyOf(req);
    if(data.action!=='approve-seller' || typeof data.accountId!=='string' ||
       !/^[a-f0-9-]{36}$/.test(data.accountId))
      return res.status(400).json({error:'Invalid approval request'});
    const accounts=await currentQuery(admin,sql=>[sql`
      UPDATE kiranapro.accounts SET approved=true WHERE id=${data.accountId} AND role='seller' AND approved=false
      RETURNING id,store_id
    `]);
    if(!accounts.length) return res.status(404).json({error:'Pending seller not found'});
    await currentQuery(admin,sql=>[sql`
      UPDATE kiranapro.stores SET is_active=true,updated_at=NOW()
      WHERE id=${accounts[0].store_id}
    `]);
    return res.status(200).json({success:true,accountId:accounts[0].id});
  }catch(error){return failClosed(res,error);}
}
