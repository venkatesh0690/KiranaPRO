import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canAddFromStore,cartReducer,EMPTY_CART,MAX_QTY_PER_ITEM} from '../src/utils/singleStoreCart.js';

const product=(id,name='Rice')=>({id,name,price:40,mrp:50,category:'Groceries'});
const apply=(cart,storeId,item)=>cartReducer(cart,{type:'ADD_ITEM',payload:{storeId,item}});
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('first store owns the cart and its own products may be incremented',()=>{
  const first=apply(EMPTY_CART,'localfresh',product('lf-1001'));
  assert.equal(first.storeId,'localfresh');
  assert.equal(first.items.length,1);
  assert.equal(first.items[0].storeId,'localfresh');
  const second=apply(first,'LOCALFRESH',product('lf-1002','Dal'));
  assert.equal(second.items.length,2);
  assert.equal(second.storeId,'localfresh');
  const bumped=apply(second,'localfresh',product('lf-1001'));
  assert.equal(bumped.items[0].quantity,2);
  assert.equal(bumped.items[0].price,40);
});
test('LocalFresh and kirana may never share a cart, in either order',()=>{
  const local=apply(EMPTY_CART,'localfresh',product('lf-1'));
  const kirana=apply(EMPTY_CART,'store-2',product('kir-1'));
  for(const [existing,incoming,id] of [
    [local,'store-2','kir-1'],
    [kirana,'localfresh','lf-1']
  ]){
    assert.equal(canAddFromStore(existing,incoming),false);
    const next=apply(existing,incoming,product(id));
    assert.strictEqual(next,existing,'reject without replacing or mutating existing cart');
    assert.equal(next.items.length,1);
  }
});
test('different neighborhood kiranas cannot mix or silently replace each other',()=>{
  const cart=apply(EMPTY_CART,31,product('abc'));
  assert.strictEqual(apply(cart,32,product('xyz')),cart);
  assert.equal(cart.storeId,'31');
  assert.equal(cart.items[0].id,'abc');
  assert.equal(canAddFromStore(cart,'31'),true);
  assert.equal(canAddFromStore(cart,'32'),false);
});
test('overlapping product IDs in two stores cannot modify the wrong store quantity',()=>{
  const cart=apply(EMPTY_CART,'store-1',product('shared'));
  assert.strictEqual(apply(cart,'store-2',product('shared')),cart);
  assert.equal(cart.items[0].quantity,1);
});
test('clearing or removing the last item permits a different seller',()=>{
  const cart=apply(EMPTY_CART,'store-1',product('x'));
  const empty=cartReducer(cart,{type:'REMOVE_ITEM',payload:{id:'x'}});
  assert.equal(empty.storeId,null);
  assert.equal(empty.items.length,0);
  const newCart=apply(empty,'store-2',product('y'));
  assert.equal(newCart.storeId,'store-2');
  const cleared=cartReducer(newCart,{type:'CLEAR_CART'});
  assert.equal(cleared.items.length,0);
  assert.equal(apply(cleared,'localfresh',product('lf-y')).storeId,'localfresh');
});
test('suspicious legacy mixed carts cannot accept further additions',()=>{
  const mixed={storeId:'store-1',items:[
    {id:'a',storeId:'store-1',quantity:1},
    {id:'b',storeId:'localfresh',quantity:1}
  ]};
  assert.equal(canAddFromStore(mixed,'store-1'),false);
  assert.strictEqual(apply(mixed,'store-1',product('c')),mixed);
});
test('unidentified sellers are not assigned to LocalFresh implicitly',()=>{
  assert.equal(canAddFromStore(EMPTY_CART,null),false);
  assert.equal(canAddFromStore(EMPTY_CART,''),false);
  assert.strictEqual(apply(EMPTY_CART,undefined,product('x')),EMPTY_CART);
  assert.strictEqual(apply(EMPTY_CART,'store-1',null),EMPTY_CART);
});
test('store-specific quantities cap at configured maximum',()=>{
  let cart=EMPTY_CART;
  for(let i=0;i<MAX_QTY_PER_ITEM+5;i++)cart=apply(cart,'localfresh',product('lf-1'));
  assert.equal(cart.items[0].quantity,MAX_QTY_PER_ITEM);
});
test('store ownership is immutable: reassigning existing products is not supported',()=>{
  const cart=apply(EMPTY_CART,'store-1',product('a'));
  assert.strictEqual(
    cartReducer(cart,{type:'SWITCH_STORE_ITEMS',payload:{fromStoreId:'store-1',toStoreId:'store-2'}}),
    cart
  );
  const page=read('src/pages/CartPage.jsx');
  assert.doesNotMatch(page,/switchStoreItems|Compare Prices Across Local Kiranas/);
  assert.doesNotMatch(page,/UNDER_25_IMPULSE_ITEMS/);
});
test('shared accessible popup explains that only one store is allowed and preserves cart',()=>{
  const source=read('src/context/CartContext.jsx');
  assert.match(source,/role="alertdialog"/);
  assert.match(source,/Items from the same store should be added to your cart/);
  assert.match(source,/Your existing cart items have not been changed/);
  assert.match(source,/if\(!canAddFromStore\(cartRef\.current,storeId\)\)/);
  assert.match(source,/setStoreConflict\(true\)/);
  assert.match(source,/cartRef\.current=next/);
  assert.match(read('src/App.jsx'),/single-store-cart\.css/);
});
test('same-store check applies to cards, detail modal, scanner, recipes and search',()=>{
  const card=read('src/components/ProductCard.jsx');
  const detail=read('src/components/ProductDetailModal.jsx');
  assert.match(card,/String\(cart\.storeId \?\? ''\)/);
  assert.match(detail,/String\(cart\.storeId \?\? ''\)/);
  const recipe=read('src/pages/RecipesPage.jsx');
  assert.match(recipe,/if \(!addItem\('localfresh'/);
  const scanner=read('src/components/ParchiScannerModal.jsx');
  assert.match(scanner,/if \(!addItem\('localfresh'/);
  const spotlight=read('src/components/CommandSpotlight.jsx');
  assert.match(spotlight,/String\(item\.id \|\| ''\).*startsWith\('lf-'\)/);
});
