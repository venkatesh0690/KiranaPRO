import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Store, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomerOrders } from '../context/OrderHistoryContext';

export default function OrdersPage() {
  const navigate=useNavigate();
  const {orders}=useCustomerOrders();
  const [selectedOrder,setSelectedOrder]=useState(null);
  const sorted=[...orders].reverse();
  const active=sorted.find(o=>o.id===selectedOrder)||sorted[0]||null;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <button type="button" className="orders-back-btn" aria-label="Back to shopping" onClick={()=>navigate('/home')}>
          <ArrowLeft size={18}/>
        </button>
        <h1 className="orders-title">Your orders</h1>
      </div>
      <p className="kp-order-demo-note" role="note">
        Demo order requests stored securely for your verified account.
        No payment, seller acceptance or confirmed delivery tracking is connected yet.
      </p>
      {!sorted.length ? (
        <div className="kp-no-orders">
          <span aria-hidden="true">🛍️</span>
          <h2>No orders yet</h2>
          <p>Your first saved demo order will appear here. WELCOME is available for order #1 on carts above ₹300.</p>
          <button type="button" onClick={()=>navigate('/home')}>Browse nearby stores <ChevronRight size={16}/></button>
        </div>
      ) : (
        <>
          <div className="live-order-card">
            <div className="loc-top-row">
              <div>
                <span className="loc-order-id">Order #{(active.orderNumber || active.id)} · {active.id}</span>
                <div className="loc-store-line"><Store size={15}/><strong>{active.storeName}</strong></div>
              </div>
              <span className="loc-status-pill active">Demo saved</span>
            </div>
            <div className="kp-order-info-row"><MapPin size={15}/>{active.storeArea}</div>
            <div className="kp-order-info-row"><Clock size={15}/>{new Date(active.placedAt).toLocaleString('en-IN')}</div>
            {active.fulfilment && (
              <div className="kp-order-info-row">
                <Clock size={15}/>
                {active.fulfilment.mode==='pickup'?'Pickup request'
                  :active.fulfilment.mode==='scheduled'?'Scheduled delivery request':'Standard delivery request'}
                {active.fulfilment.date && ` · ${active.fulfilment.date}`}
                {active.fulfilment.slot && ` · ${active.fulfilment.label}`}
              </div>
            )}
            <div className="order-stepper">
              <div className="step-item done">
                <div className="step-circle-track"><div className="step-circle"><CheckCircle2 size={15}/></div></div>
                <div className="step-text"><span className="step-title">Order request recorded</span><span className="step-time">Demo request — no confirmed seller acceptance</span></div>
              </div>
            </div>
            <div className="kp-order-receipt">
              <strong>Items: ₹{active.subtotal}</strong>
              <span>{active.fulfilment?.mode==='pickup'?'Pickup delivery fee':'Delivery'}: ₹{active.deliveryFee}</span>
              <span>Handling: ₹{active.handlingFee ?? 5} · Estimated GST: ₹{active.tax ?? 0}</span>
              <span>Discount: -₹{active.discount} {active.discountCode ? `(${active.discountCode})` : ''}</span>
              <strong>Total: ₹{active.total}</strong>
            </div>
          </div>
          <div className="my-orders-section">
            <h2 className="my-orders-heading">Order history ({sorted.length})</h2>
            <div className="orders-list">
              {sorted.map(ord=>(
                <button type="button" key={ord.id}
                  className={`order-summary-card ${active.id===ord.id?'selected':''}`}
                  onClick={()=>setSelectedOrder(ord.id)}>
                  <div className="osc-top">
                    <div>
                      <span className="osc-id">#{(ord.orderNumber || ord.id)} · {ord.storeName}</span>
                      <span className="osc-date">{new Date(ord.placedAt).toLocaleString('en-IN')}</span>
                      <span className="osc-date">
                        {ord.fulfilment?.mode==='pickup'?'Store pickup'
                          :ord.fulfilment?.mode==='scheduled'?'Scheduled delivery':'Standard delivery'}
                        {ord.fulfilment?.date ? ` · ${ord.fulfilment.date} · ${ord.fulfilment.label}` : ''}
                      </span>
                    </div>
                    <span className="osc-badge">Demo saved</span>
                  </div>
                  <div className="osc-items-preview">
                    {(ord.items||[]).map(item=>(
                      <div className="osc-item-line" key={item.id}>
                        <span className="osc-item-name">{item.name}</span>
                        <span className="osc-item-calc">{item.qty} × ₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="osc-bottom">
                    <span className="osc-total-label">{ord.discountCode ? `Offer: ${ord.discountCode}` : 'Order summary'}</span>
                    <span className="osc-total-val">₹{ord.total}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
