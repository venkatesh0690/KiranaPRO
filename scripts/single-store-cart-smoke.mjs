// Headless mobile validation of the real single-store cart dialog.
// Requires playwright installed in CI; run against local Vite preview.
import { chromium } from 'playwright';
const origin=process.argv[2]||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const modes=[
  {name:'LocalFresh then kirana',first:'localfresh',second:'kirana'},
  {name:'Kirana then LocalFresh',first:'kirana',second:'localfresh'}
];
let tested=0;
try {
  for (const mode of modes) {
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try {
      await page.goto(origin+'/home',{waitUntil:'domcontentloaded',timeout:30000});
      const lf='a.store-card[href$="/store/localfresh"]';
      const kir='a.store-card[href*="/store/"]:not([href$="/store/localfresh"])';
      await page.locator(lf).first().waitFor({timeout:18000});
      await page.locator(kir).first().waitFor({timeout:18000});
      const goToStore=async kind=>{
        const sel=kind==='localfresh'?lf:kir;
        await page.locator(sel).first().click({timeout:12000});
        await page.waitForURL('**/store/*',{timeout:12000});
        const add=page.locator('.pc-add-btn:not([disabled])').filter({hasText:/^ADD$/}).first();
        await add.waitFor({timeout:15000});
        return add;
      };
      let add=await goToStore(mode.first);
      await add.click();
      const total=page.locator('.kp-fcb-count').first();
      await total.waitFor({timeout:10000});
      const before=await total.textContent();
      if(!/1 item/.test(before))throw Error('First item not in cart: '+before);
      await page.goBack({waitUntil:'domcontentloaded'});
      await page.locator(lf).first().waitFor({timeout:12000});
      add=await goToStore(mode.second);
      await add.click();
      await page.getByRole('alertdialog',{name:'One store per cart'}).waitFor({timeout:10000});
      const popup=await page.getByRole('alertdialog').innerText();
      if(!popup.includes('Items from the same store should be added to your cart')||
         !popup.includes('Your existing cart items have not been changed')){
        throw Error('Wrong warning dialog: '+popup.slice(0,240));
      }
      const after=await total.textContent();
      if(before!==after)throw Error('Cross-store item changed cart: '+before+' => '+after);
      await page.getByRole('button',{name:'OK, keep my cart'}).click();
      if(errors.length)throw Error('Browser page errors: '+errors.slice(0,4).join(' | '));
      tested++;
      console.log('SINGLE_STORE_SMOKE_SUCCESS '+JSON.stringify({mode:mode.name,before,after,url:page.url()}));
    }catch(e){
      console.log('SINGLE_STORE_SMOKE_FAILURE '+JSON.stringify({
        mode:mode.name,url:page.url(),message:String(e).slice(0,1000),
        heading:(await page.locator('h1,h2').allTextContents().catch(()=>[])).slice(0,6),
        errors:errors.slice(0,5)
      }));
      throw e;
    }finally{await page.close()}
  }
  console.log('SINGLE_STORE_SMOKE_RESULT '+JSON.stringify({tested,total:modes.length}));
}finally{await browser.close()}
