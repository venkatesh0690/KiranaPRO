// Browser-level regression for one-store-per-cart behaviour.
// Uses sample storefronts only; does not place orders or use real credentials.
import {chromium} from 'playwright';

const origin=process.argv[2] || 'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.getByRole('link',{name:/Open LocalFresh/i}).first().click({timeout:15000});
  await page.locator('.pc-add-btn:not([disabled])').first().click({timeout:15000});
  await page.locator('.kp-fcb-count').getByText('1 item').waitFor({timeout:12000});
  await page.getByRole('button',{name:'Back to home'}).click({timeout:12000});
  await page.getByRole('link',{name:/Open Siripuram Daily Basket/i}).click({timeout:15000});
  await page.locator('.pc-add-btn:not([disabled])').first().click({timeout:15000});
  const modal=page.getByRole('alertdialog',{name:'One store per cart'});
  await modal.waitFor({timeout:10000});
  const contents=await modal.innerText();
  if(!contents.includes('LocalFresh')||!contents.includes('Siripuram Daily Basket')||
     !contents.includes('Your existing cart has not been changed'))
    throw new Error('Cart conflict popup did not identify the two stores');
  await modal.getByRole('button',{name:'Got it'}).click();
  await page.getByRole('button',{name:/Cart with 1 item/}).click({timeout:10000});
  await page.getByRole('heading',{name:'Review your basket'}).waitFor({timeout:10000});
  const cartText=await page.locator('.cart-store-card').innerText();
  if(!cartText.includes('LocalFresh'))throw new Error('Cart owner was silently overwritten');
  if(errors.length)throw new Error('Browser runtime errors: '+errors.join(' | '));
  console.log('SINGLE_STORE_CART_SMOKE_SUCCESS',JSON.stringify({
    origin,retainedStore:'LocalFresh',blockedIncomingStore:'Siripuram Daily Basket',
    dialogShown:true,cartPreserved:true,errors:0
  }));
}finally {await browser.close()}
