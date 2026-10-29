/* Indicative fulfilment requests for the client-side demo checkout.
 * No store calendar or capacity provider is connected; these are NOT confirmed slots.
 * Every time is in Asia/Kolkata (IST), not the browser's local timezone. */
export const FULFILMENT_MODES = Object.freeze([
  {id:'standard',title:'Standard delivery',description:'Normal delivery request; no guaranteed time'},
  {id:'scheduled',title:'Schedule delivery',description:'Request a two-hour delivery window'},
  {id:'pickup',title:'Store pickup',description:'Request a time to collect your packed order'}
]);
export const FULFILMENT_ZONE = 'Asia/Kolkata';
const OPEN_MINUTES=10*60;
const CLOSE_MINUTES=20*60;
const LEAD={scheduled:60,pickup:45};
export const HANDLING_FEE = 5;

function indiaDateParts(now) {
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-GB',{
    timeZone:FULFILMENT_ZONE,year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(now).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
  return [Number(fields.year),Number(fields.month),Number(fields.day)];
}
export function getFulfilmentDates(now=new Date(), days=7) {
  const [year,month,day] = indiaDateParts(now);
  return Array.from({length:days},(_,offset)=>{
    const date=new Date(Date.UTC(year,month-1,day+offset));
    const value=date.toISOString().slice(0,10);
    const label=offset===0?'Today':offset===1?'Tomorrow':
      new Intl.DateTimeFormat('en-IN',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(date);
    return {value,label};
  });
}
export function formatSlotClock(minutes) {
  const hour=Math.floor(minutes/60);
  const mins=minutes%60;
  return `${(hour%12)||12}:${String(mins).padStart(2,'0')} ${hour<12?'AM':'PM'}`;
}
export function getSlotTimestamp(date,minutes) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)|| !Number.isInteger(minutes))return NaN;
  return Date.parse(`${date}T${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}:00+05:30`);
}
export function getFulfilmentSlots(mode,date,now=new Date()) {
  if(!['scheduled','pickup'].includes(mode)||!/^\d{4}-\d{2}-\d{2}$/.test(date))return [];
  const dates=getFulfilmentDates(now).map(d=>d.value);
  if(!dates.includes(date))return [];
  const step=mode==='pickup'?30:60;
  const duration=mode==='pickup'?0:120;
  const minLead=LEAD[mode]*60*1000;
  const options=[];
  for(let minute=OPEN_MINUTES;minute+duration<=CLOSE_MINUTES;minute+=step){
    if(getSlotTimestamp(date,minute) - now.getTime() < minLead)continue;
    options.push({
      value:String(minute),
      startMinutes:minute,
      label:mode==='pickup'
        ? formatSlotClock(minute)
        : `${formatSlotClock(minute)} – ${formatSlotClock(minute+duration)}`
    });
  }
  return options;
}
export function validateFulfilment(selection,now=new Date()) {
  if(!selection || !FULFILMENT_MODES.some(x=>x.id===selection.mode))
    return {valid:false,reason:'Choose an order service.'};
  if(selection.mode==='standard')return {valid:true,mode:'standard',date:null,slot:null,label:'Standard delivery request'};
  const date=String(selection.date||'');
  const slot=String(selection.slot||'');
  const match=getFulfilmentSlots(selection.mode,date,now).find(s=>s.value===slot);
  if(!match)return {valid:false,reason:'Choose an available future date and time again.'};
  return {valid:true,mode:selection.mode,date,slot:match.value,label:match.label,
    timezone:FULFILMENT_ZONE,
    requestedStart:new Date(getSlotTimestamp(date,match.startMinutes)).toISOString()};
}
export function quoteFulfilment({store,subtotal,discount=0,mode='standard',handlingFee=HANDLING_FEE}) {
  const itemTotal=Math.max(0,Number(subtotal)||0);
  const savings=Math.min(itemTotal,Math.max(0,Number(discount)||0));
  const deliveryFee=mode==='pickup'?0:
    itemTotal>300 ? 0 : Math.max(0,Number(store?.deliveryFee)||0);
  // Current app uses 5% estimated tax on discounted goods; no category-level GST engine exists.
  const tax=Math.round((itemTotal-savings)*0.05);
  return {subtotal:itemTotal,discount:savings,deliveryFee,
    handlingFee,tax,total:itemTotal-savings+deliveryFee+handlingFee+tax};
}
