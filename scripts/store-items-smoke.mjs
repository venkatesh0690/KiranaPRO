import {chromium} from 'playwright';
const origin=process.argv[2]||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const areas=['NAD Kotha Road','Dabagardens','Siripuram','MVP Colony','Gajuwaka'];
let tested=0,failed=0;
try{
 for(const area of areas){
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
  try {
   await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:25000});
   const guest=page.getByRole('button',{name:/Explore as guest/i});
   if(await guest.count())await guest.click({timeout:8000});
   const picker=page.getByRole('heading',{name:'Select your area'});
   if(await picker.count()){
     await page.getByRole('button',{name:new RegExp(area)}).first().click({timeout:6000});
     await page.getByRole('button',{name:/Continue to stores/i}).click({timeout:6000});
   }
   await page.waitForURL('**/home',{timeout:12000});
   const cards=page.locator('a.store-card[href*="/store/"]');
   await cards.first().waitFor({timeout:12000});
   const urls=await cards.evaluateAll(nodes=>[...new Set(nodes.map(n=>n.getAttribute('href')))].slice(0,14));
   console.log('STORE_AREA '+JSON.stringify({area,urls}));
   for(const href of urls){
     const direct=page.locator('a.store-card').filter({visible:true}).locator('xpath=..'); // no-op
     pageErrors.length=0;
     await page.goto(origin+href,{waitUntil:'domcontentloaded',timeout:25000});
     try{
       await page.locator('.sp-scrollable-products .pc-name').first().waitFor({timeout:6500});
       const heading=await page.locator('h1.sp-hdr-store-name').first().innerText();
       const count=await page.locator('.sp-scrollable-products .pc-name').count();
       if(pageErrors.length)throw Error(pageErrors.join(' | '));
       console.log('STORE_PAGE_OK '+JSON.stringify({area,href,heading,count}));
       tested++;
     }catch(e){
       failed++;
       console.log('STORE_PAGE_FAILURE '+JSON.stringify({area,href,reason:String(e).slice(0,360),
         url:page.url(),errors:pageErrors.slice(0,3),
         body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,420)}));
     }
   }
   // Ensure home-card navigation works (not only direct URLs).
   await page.goto(origin+'/home',{waitUntil:'domcontentloaded',timeout:25000});
   await cards.first().click({timeout:8000});
   await page.waitForURL('**/store/*',{timeout:10000});
   await page.locator('.sp-scrollable-products .pc-name').first().waitFor({timeout:9000});
   if(pageErrors.length)throw Error('Click navigation: '+pageErrors.join(' | '));
   tested++;
  }catch(e){failed++;console.log('STORE_AREA_FAILURE '+JSON.stringify({area,reason:String(e).slice(0,400),
    url:page.url(),errors:pageErrors.slice(0,4),
    body:(await page.locator('body').innerText().catch(()=>'' )).slice(0,300)}));}
  finally {await page.close()}
 }
 console.log('STORE_PAGE_SUMMARY '+JSON.stringify({origin,tested,failed}));
 if(failed)process.exitCode=1;
} finally{await browser.close()}
