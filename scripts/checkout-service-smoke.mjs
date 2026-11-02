// Browser test of the current basket -> existing /checkout service screen.
// No account, payment, real order or seller credentials are used.
import {chromium} from 'playwright';

const origin=process.argv[2]||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let passed=0;
try {
  for(const storeName of ['LocalFresh','Siripuram Daily Basket']){
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try {
      await page.goto(origin+'/home',{waitUntil:'domcontentloaded',timeout:30000});
      await page.getByRole('link',{name:new RegExp('Open '+storeName,'i')}).first().click({timeout:16000});
      await page.waitForURL('**/store/*',{timeout:16000});
      await page.locator('.pc-add-btn:not([disabled])').first().click({timeout:16000});
      await page.getByRole('button',{name:/Cart with 1 item/i}).click({timeout:16000});
      await page.waitForURL('**/cart',{timeout:15000});
      await page.getByRole('heading',{name:'Review your basket'}).waitFor({timeout:15000});
      const basket=await page.locator('.cart-store-card').innerText();
      if(!basket.toLowerCase().includes(storeName.toLowerCase()))throw Error('Cart owner mismatch '+basket.slice(0,160));
      const continueButton=page.locator('button.cart-checkout-btn');
      if(!await continueButton.isEnabled())throw Error('Checkout button is disabled for '+storeName);
      await continueButton.click();
      await page.waitForURL('**/checkout',{timeout:12000});
      await page.getByRole('heading',{name:'Choose order service'}).waitFor({timeout:12000});
      await page.getByRole('heading',{name:'How would you like your groceries?'}).waitFor({timeout:12000});
      await page.getByRole('button',{name:/Order now/i}).waitFor({timeout:10000});
      await page.locator('.kp-pickup-coins-badge').getByText(/5% KiranaCoins/).waitFor({timeout:10000});
      await page.getByRole('button',{name:/Store pickup/i}).click();
      await page.locator('.kp-pickup-coins-details').getByText(/Earn 5% KiranaCoins/).waitFor({timeout:10000});
      await page.getByText(/This demo checkout does not automatically credit coins/).waitFor({timeout:10000});
      await page.getByRole('button',{name:/Schedule delivery/i}).click();
      if(await page.locator('.kp-pickup-coins-details').count())throw Error('Pickup-only reward must not appear on scheduled delivery');
      await page.locator('.kp-fulfilment-date').nth(1).click();
      await page.locator('.kp-fulfilment-slot').first().click({timeout:8000});
      const selected=await page.locator('.kp-fulfilment-selection').innerText();
      if(!selected.includes('Requested:'))throw Error('Scheduled time was not selected');
      if(storeName==='LocalFresh') {
        if(!await continueButton.isEnabled())throw Error('Schedule save should be enabled for non-sample store');
        await page.getByRole('button',{name:'Back to cart review'}).click();
        await page.waitForURL('**/cart',{timeout:12000});
        const returned=await page.locator('.cart-store-card').innerText();
        if(!returned.includes('LocalFresh'))throw Error('Basket lost on checkout back');
        await continueButton.click();
        await page.waitForURL('**/checkout',{timeout:12000});
        await page.getByRole('button',{name:/Order now/i}).click();
        if(!await continueButton.isEnabled())throw Error('Order-now sign-in action unavailable');
        await continueButton.click();
        await page.locator('.auth-modal-card').first().waitFor({timeout:10000});
      } else {
        if(await continueButton.isEnabled())throw Error('Sample store must not accept orders');
        if(!(await continueButton.innerText()).includes('Sample store'))throw Error('Sample store warning missing');
      }
      if(errors.length)throw Error('Browser errors: '+errors.slice(0,3).join(' | '));
      passed++;
      console.log('CHECKOUT_SMOKE_SUCCESS '+JSON.stringify({store:storeName,serviceRoute:'/checkout',selected,errors:0}));
    }catch(e){
      console.log('CHECKOUT_SMOKE_FAILURE '+JSON.stringify({store:storeName,url:page.url(),
        reason:String(e).slice(0,650),headings:await page.locator('h1,h2').allTextContents().catch(()=>[]),
        errors:errors.slice(0,3)}));
      throw e;
    }finally{await page.close();}
  }
  console.log('CHECKOUT_SMOKE_RESULT '+JSON.stringify({passed,total:2}));
}finally{await browser.close();}
