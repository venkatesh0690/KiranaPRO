// Browser-safe KiranaPRO API adapter.
// Neon DATABASE_URL is NEVER evaluated or transported into a Vite bundle.
// Database access is confined to serverless handlers under /api.
async function read(path) {
  try{
    const response=await fetch(path,{credentials:'same-origin',cache:'no-store'});
    if(!response.ok) return null;
    return response.json();
  }catch{return null;}
}
// Direct SQL is deliberately unavailable to browser code.
export const getNeonSql=()=>null;
export async function fetchStoresFromNeon(){
  const result=await read('/api/catalog');
  return result?.stores ?? null;
}
export async function fetchProductsFromNeon(storeId){
  const result=await read('/api/catalog?storeId='+encodeURIComponent(String(storeId)));
  return result?.products ?? null;
}
export async function recordOrderInNeon(){
  // Use useCustomerOrders().recordOrder() for verified, server-priced checkout.
  // Disallow the former untrusted direct-SQL order insertion path.
  return false;
}
export async function logSecurityEventToNeon(){
  // Security audit entries must originate at the trusted server.
  return false;
}
