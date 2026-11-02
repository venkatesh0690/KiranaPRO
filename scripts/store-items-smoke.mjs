// Test real mobile home -> store tap, then store-item rendering.
import {chromium} from 'playwright';
const origin=process.argv[2]||'http://127.0.0.1:4173';
const areas=['NAD Kotha Road','Dabagardens','Siripuram','MVP Colony','Gajuwaka'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0,failed=0;
try{
 for(const area of areas){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const faults=[];
  page.on('pageerror',e=>faults.push(e.message));
  try{
   await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:20000});
   const guest=page.getByRole('button',{name:/Explore as guest/i});
   if(await guest.count())await guest.click({timeout:7000});
   if(await page.getByRole('heading',{name:'Select your area'}).count()){
    await page.getByRole('button',{name:new RegExp(area)}).first().click({timeout:6000});
    await page.getByRole('button',{name:/Continue to stores/}).click({timeout:6000});
   }
   await page.waitForURL('**/home',{timeout:10000});
   await page.locator('a.store-card').first().waitFor({timeout:10000});
   const hrefs=await page.locator('a.store-card').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('href')))].slice(0,2));
   for(const href of hrefs){
    faults.length=0;
    await page.locator('a.store-card[href="'+href+'"]').first().click({timeout:8000});
    try{
      await page.waitForURL('**/store/*',{timeout:7500});
      await page.locator('.sp-scrollable-products .pc-name').first().waitFor({timeout:5000});
      const names=await page.locator('.sp-scrollable-products .pc-name').count();
      if(faults.length)throw Error('pageerror: '+faults.join(' | '));
      passed++;
      console.log('STORE_PAGE_OK '+JSON.stringify({area,href,names}));
    }catch(e){
      failed++;
      console.log('STORE_PAGE_FAIL '+JSON.stringify({area,href,reason:String(e).slice(0,450),
        url:page.url(),errors:faults.slice(0,3),body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,440)}));
    }
    await page.goBack({waitUntil:'domcontentloaded',timeout:12000});
    await page.waitForURL('**/home',{timeout:10000});
    await page.locator('a.store-card').first().waitFor({timeout:7000});
   }
  }catch(e){failed++;console.log('STORE_AREA_FAIL '+JSON.stringify({area,reason:String(e).slice(0,500),errors:faults.slice(0,3),url:page.url()}));}
  finally{await page.close()}
 }
 console.log('STORE_PAGE_SUMMARY '+JSON.stringify({origin,passed,failed}));
 if(failed)process.exitCode=1;
}finally{await browser.close()}
