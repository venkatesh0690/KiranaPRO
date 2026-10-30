// Mobile Chromium smoke: guest -> each supported area -> populated storefront.
// Usage: node scripts/location-smoke.mjs https://kiranapro-two.vercel.app
import { chromium } from 'playwright';
const target=process.argv[2]||'http://127.0.0.1:4173';
const areas=['NAD Kotha Road','Dabagardens','Siripuram','MVP Colony','Gajuwaka'];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0;
try{
  for(const area of areas){
    const page=await browser.newPage({
      viewport:{width:390,height:844},deviceScaleFactor:1,
      userAgent:'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36'
    });
    const errors=[];
    page.on('pageerror',err=>errors.push('Runtime: '+err.message.slice(0,300)));
    page.on('console',msg=>{
      if(msg.type()==='error' && /Content Security Policy|module|chunk|uncaught|404/.test(msg.text()))
        errors.push('Console: '+msg.text().slice(0,220));
    });
    try{
      await page.goto(target,{waitUntil:'domcontentloaded',timeout:30000});
      await page.getByRole('button',{name:/Explore as guest/i}).click({timeout:15000});
      await page.getByRole('heading',{name:'Select your area'}).waitFor({timeout:14000});
      await page.getByRole('button',{name:new RegExp(area)}).click({timeout:8000});
      await page.getByRole('button',{name:/Continue to stores/}).click({timeout:8000});
      await page.waitForURL('**/home',{timeout:12000});
      await page.getByRole('heading',{name:'Shop by category'}).waitFor({timeout:12000});
      await page.getByRole('heading',{name:new RegExp('Stores in '+area)}).waitFor({timeout:12000});
      await page.waitForTimeout(1100);
      if(errors.some(x=>x.startsWith('Runtime:')))throw Error(errors.join(' | '));
      console.log('LOCATION_SMOKE_SUCCESS',JSON.stringify({
        target,area,url:page.url(),bannerErrors:errors.length,errors:errors.slice(0,2)
      }));
      passed++;
    }catch(error){
      console.log('LOCATION_SMOKE_FAILURE',JSON.stringify({
        target,area,url:page.url(),body:(await page.locator('body').innerText()).slice(0,280),
        errors,reason:String(error).slice(0,400)
      }));
      throw error;
    }finally{await page.close()}
  }
  console.log('LOCATION_SMOKE_SUMMARY',JSON.stringify({target,passed,total:areas.length}));
}finally{await browser.close()}
