// Browser smoke: catches runtime crashes and redirect loops after area selection.
// Example: node scripts/location-smoke.mjs http://127.0.0.1:4173
import { chromium } from 'playwright';

const target=process.argv[2]||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];
try {
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,
    userAgent:'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36'});
  page.on('pageerror',err=>failures.push('Runtime: '+err.message.slice(0,400)));
  page.on('console',msg=>{if(msg.type()==='error')failures.push('Console: '+msg.text().slice(0,300))});
  page.on('requestfailed',req=>{if(new URL(req.url()).origin===new URL(target).origin)
    failures.push('Request: '+req.url()+' '+req.failure()?.errorText)});
  await page.goto(target,{waitUntil:'domcontentloaded',timeout:30000});
  await page.getByRole('button',{name:/Explore as guest/i}).click({timeout:18000});
  await page.getByRole('heading',{name:'Select your area'}).waitFor({timeout:15000});
  await page.getByRole('button',{name:/MVP Colony/}).click({timeout:10000});
  await page.getByRole('button',{name:/Continue to stores/}).click({timeout:10000});
  await page.waitForTimeout(3500);
  const state={target,url:page.url(),heading:(await page.locator('h1,h2').allTextContents()).slice(0,5),
    body:(await page.locator('body').innerText()).slice(0,750),failures:failures.slice(0,10)};
  console.log('LOCATION_SMOKE_RESULT',JSON.stringify(state));
  if(!new URL(page.url()).pathname.startsWith('/home') ||
     !(await page.getByText('Shop by category').count()) ||
     failures.some(x=>x.startsWith('Runtime:')))throw Error('Location-to-home flow failed');
  console.log('LOCATION_SMOKE_SUCCESS',target);
}finally{await browser.close();}
