import { CalendarDays, Check, ChevronLeft, Clock3, MapPin, PackageCheck, Truck } from 'lucide-react';
import { FULFILMENT_MODES, getFulfilmentDates, getFulfilmentSlots, validateFulfilment } from '../utils/fulfilment';

const serviceIcons={standard:Truck,scheduled:CalendarDays,pickup:PackageCheck};

export default function FulfilmentPicker({value,onChange,store,area}) {
  const now=new Date();
  const dates=getFulfilmentDates(now);
  const slots=getFulfilmentSlots(value.mode,value.date,now);
  const chosen=validateFulfilment(value,now);
  return (
    <section className="kp-fulfilment-panel" aria-labelledby="kp-fulfilment-heading">
      <div className="kp-fulfilment-topline">
        <span className="kp-fulfilment-kicker">02 / ORDER SERVICE</span>
        <span className="kp-fulfilment-step">Choose a fulfilment option</span>
      </div>
      <h2 id="kp-fulfilment-heading">How would you like your groceries?</h2>
      <p className="kp-fulfilment-lead">Pick delivery or collect a packed order from the store.</p>
      <div className="kp-fulfilment-modes" role="group" aria-label="Order service">
        {FULFILMENT_MODES.map(mode=>{
          const Icon=serviceIcons[mode.id];
          const selected=value.mode===mode.id;
          return (
            <button type="button" key={mode.id}
              className={`kp-fulfilment-mode ${selected?'selected':''}`}
              aria-pressed={selected}
              onClick={()=>onChange({mode:mode.id,date:'',slot:''})}>
              <span className="kp-fulfilment-mode-icon"><Icon size={21} strokeWidth={1.8}/></span>
              <span className="kp-fulfilment-mode-copy">
                <strong>{mode.title}</strong>
                <small>{mode.description}</small>
              </span>
              <span className="kp-fulfilment-mode-check">{selected?<Check size={17}/>:null}</span>
            </button>
          );
        })}
      </div>

      {value.mode==='standard' && (
        <div className="kp-fulfilment-callout">
          <Truck size={19} aria-hidden="true"/>
          <span>Delivery is free above ₹300. For smaller baskets, the store's normal delivery fee applies. Estimated arrival is not guaranteed.</span>
        </div>
      )}

      {value.mode==='pickup' && (
        <div className="kp-fulfilment-pickup-address">
          <MapPin size={19} aria-hidden="true"/>
          <div>
            <strong>Pick up at {store?.name||'the selected store'}</strong>
            <span>{store?.address||area} <em>(listed address; verify before travel)</em></span>
            <small>₹0 delivery even below ₹300 · Handling fee and estimated GST only.</small>
          </div>
        </div>
      )}

      {value.mode==='scheduled' && (
        <div className="kp-fulfilment-callout">
          <Clock3 size={19} aria-hidden="true"/>
          <span>Choose a two-hour delivery window, such as 2:00 PM – 4:00 PM or 3:00 PM – 5:00 PM. The delivery fee follows the ₹300 rule.</span>
        </div>
      )}

      {value.mode!=='standard' && (
        <>
          <div className="kp-fulfilment-group">
            <div className="kp-fulfilment-group-title"><CalendarDays size={17}/><strong>Choose a day</strong></div>
            <div className="kp-fulfilment-date-row" role="group" aria-label="Choose order date">
              {dates.map(day=>(
                <button type="button" key={day.value}
                  className={`kp-fulfilment-date ${value.date===day.value?'selected':''}`}
                  aria-pressed={value.date===day.value}
                  onClick={()=>onChange({...value,date:day.value,slot:''})}>
                  <strong>{day.label}</strong>
                  <small>{new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(day.value+'T00:00:00Z'))}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="kp-fulfilment-group">
            <div className="kp-fulfilment-group-title"><Clock3 size={17}/><strong>{value.mode==='pickup'?'Choose pickup time':'Choose delivery window'}</strong></div>
            {!value.date ? (
              <p className="kp-fulfilment-empty">Select a day to see future time options.</p>
            ) : slots.length ? (
              <div className="kp-fulfilment-slot-grid" role="group" aria-label="Choose a time slot">
                {slots.map(slot=>(
                  <button key={slot.value} type="button"
                    className={`kp-fulfilment-slot ${value.slot===slot.value?'selected':''}`}
                    aria-pressed={value.slot===slot.value}
                    onClick={()=>onChange({...value,slot:slot.value})}>
                    {slot.label}
                    {value.slot===slot.value && <Check size={15}/>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="kp-fulfilment-empty">No remaining time options for this day. Select the next day.</p>
            )}
          </div>
        </>
      )}
      {value.mode!=='standard' && chosen.valid && (
        <div className="kp-fulfilment-selection" role="status">
          <Check size={17}/>Requested: {value.date} · {chosen.label}
        </div>
      )}
      <p className="kp-fulfilment-disclaimer">
        These are <strong>requested</strong> times for a demo order, not confirmed bookings.
        Store opening hours, packing capacity and delivery slots have not yet been connected.
        A store must separately accept the request and confirm any pickup point and readiness time.
        No payment or fulfilment is arranged by submitting this form.
      </p>
    </section>
  );
}
