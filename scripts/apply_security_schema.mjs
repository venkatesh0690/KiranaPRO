// Apply additive base schema and FORCE RLS in the selected Neon database.
// Never logs credentials; use DATABASE_URL from a server/CLI environment.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {neon} from '@neondatabase/serverless';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const sql=neon(process.env.DATABASE_URL);
for(const file of ['neon_schema.sql','security/rls.sql']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const commands=source
    .replace(/^\s*--.*$/gm,'')
    .split(/;\s*(?:\r?\n|$)/)
    .map(statement=>statement.trim()).filter(Boolean);
  for(const command of commands){
    const match=/^CREATE\s+POLICY\s+(\w+)\s+ON\s+kiranapro\.(\w+)/i.exec(command);
    if(match){
      const policy=await sql`
        SELECT 1 FROM pg_policies
        WHERE schemaname='kiranapro' AND tablename=${match[2]} AND policyname=${match[1]}
      `;
      if(policy.length)continue;
    }
    await sql.query(command);
  }
  console.log('Applied',file);
}
const result=await sql`
  SELECT relname,relrowsecurity,relforcerowsecurity
  FROM pg_class WHERE relnamespace='kiranapro'::regnamespace AND relkind='r'
  ORDER BY relname
`;
if(result.some(r=>!r.relrowsecurity || !r.relforcerowsecurity))
  throw new Error('One or more marketplace tables lack forced RLS');
console.log('All',result.length,'KiranaPRO tables have forced RLS.');
