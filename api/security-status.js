import {safeMethod,requireUser,currentQuery,failClosed} from './_security.js';

// This endpoint is deliberately limited to objective, read-only database
// configuration checks. It does not claim to be a penetration test or a
// comprehensive security certificate.
const REQUIRED_TABLES=[
  'accounts','admin_setup_claims','catalog_ai_images','login_attempts',
  'orders','products','security_audit_logs','sessions','stores'
];

export default async function handler(req,res){
  if(!safeMethod(req,res,['GET']))return;
  try{
    const admin=await requireUser(req,res,['admin']);
    if(!admin)return;
    const tables=await currentQuery(admin,sql=>[sql`
      SELECT c.relname AS table_name,c.relrowsecurity AS rls_enabled,
             c.relforcerowsecurity AS rls_forced,
             EXISTS(SELECT 1 FROM pg_policy p WHERE p.polrelid=c.oid) AS has_policy
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='kiranapro' AND c.relkind IN ('r','p')
      ORDER BY c.relname
    `]);
    const roles=await currentQuery(admin,sql=>[sql`
      SELECT rolbypassrls,rolcanlogin FROM pg_roles WHERE rolname='kiranapro_rls_api'
    `]);
    const byName=new Map(tables.map(row=>[row.table_name,row]));
    const missing=REQUIRED_TABLES.filter(name=>!byName.has(name));
    const unprotected=tables.filter(row=>!row.rls_enabled||!row.rls_forced).map(row=>row.table_name);
    const policyMissing=REQUIRED_TABLES.filter(name=>!byName.get(name)?.has_policy);
    const rlsPassed=missing.length===0&&unprotected.length===0;
    const policyPassed=missing.length===0&&policyMissing.length===0;
    const rolePassed=roles.length===1&&!roles[0].rolbypassrls&&!roles[0].rolcanlogin;
    return res.status(200).json({
      checkedAt:new Date().toISOString(),
      checks:[
        {name:'Forced row-level security',status:rlsPassed?'PASS':'FAIL',
         detail:rlsPassed?`Verified on ${tables.length} database tables`:
           `Missing: ${missing.join(', ')||'none'}; without forced RLS: ${unprotected.join(', ')||'none'}`},
        {name:'RLS policies present',status:policyPassed?'PASS':'FAIL',
         detail:policyPassed?'All required tables have at least one access policy':
           `Missing policies: ${policyMissing.join(', ')||'none'}`},
        {name:'Application query role',status:rolePassed?'PASS':'FAIL',
         detail:rolePassed?'API role cannot log in or bypass RLS':
           'Review the API role login and BYPASSRLS permissions'}
      ],
      note:'Configuration checks only. This does not verify external attacks, client bundles, or tenant-to-tenant access with live test accounts.'
    });
  }catch(error){return failClosed(res,error)}
}
