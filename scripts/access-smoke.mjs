// Public-browser smoke test. No credentials or private records are accessed.
// Run: node scripts/access-smoke.mjs https://kiranapro-two.vercel.app
import {chromium} from 'playwright';
const origin=process.argv[2]||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let errors=0;
try {
  for(const mode of ['mobile','desktop']){
    const page=await browser.newPage(mode==='mobile'?{
      viewport:{width:390,height:844},isMobile:true,hasTouch:true,
      userAgent:'Mozilla/5.0 (Linux; Android 15; Mobile) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36'
    }:{viewport:{width:1365,height:900}});
    const faults=[],badResponses=[];
    page.on('pageerror',e=>faults.push('js '+e.message.slice(0,240)));
    page.on('console',m=>{if(m.type()==='error')faults.push('console '+m.text().slice(0,250))});
    page.on('response',r=>{
      if(new URL(r.url()).origin===new URL(origin).origin &&
         r.status()>=400 && (/\/assets\/|\/api\//.test(r.url())))
        badResponses.push({code:r.status(),url:r.url().slice(-130)});
    });
    async function snapshot(stage){
      const val={mode,stage,url:page.url(),title:await page.title(),
        rootCount:await page.locator('#root').count(),
        visible:await page.locator('#root').innerText().then(x=>x.slice(0,480)).catch(e=>String(e)),
        pageErrors:faults.filter(x=>x.startsWith('js')).slice(0,5),
        consoleErrors:faults.slice(0,8),badResponses:badResponses.slice(0,7)};
      console.log('ACCESS_SNAPSHOT '+JSON.stringify(val));
      if(val.pageErrors.length || !val.rootCount || !val.visible.trim() ||
         /Could not open this page/.test(val.visible))errors++;
    }
    try {
      await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForTimeout(2500);
      await snapshot('root');
      const loc=page.getByRole('button',{name:/Delivering to|Choose your delivery area|Select.*area/i}).first();
      if(await loc.count()){
        await loc.click({timeout:8000});
        await page.waitForTimeout(500);
        await snapshot('location page');
        const area=page.getByRole('button',{name:/MVP Colony/});
        if(await area.count()){
          await area.click({timeout:8000});
          await page.getByRole('button',{name:/Continue to stores/}).click({timeout:8000});
          await page.waitForTimeout(1800);
          await snapshot('after area selection');
        }
      }
      await page.goto(origin+'/home',{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForTimeout(1800);
      await snapshot('direct home');
      await page.goto(origin+'/store/localfresh',{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForTimeout(1600);
      await snapshot('direct localfresh');
      await page.goto(origin+'/admin/login',{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForTimeout(1000);
      await snapshot('admin login');
    }catch(e){errors++;console.log('ACCESS_FAILURE '+JSON.stringify({mode,at:page.url(),message:String(e).slice(0,700),faults:faults.slice(0,10)}))}
    finally{await page.close()}
  }
  console.log('ACCESS_RESULT '+JSON.stringify({origin,errors}));
  if(errors)process.exitCode=1;
}finally{await browser.close()}
