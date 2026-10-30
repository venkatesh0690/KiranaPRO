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

            {/* ── DoorDash DoubleDash 10-Minute Add-On Window (Phase 14 Prompt 14.1) ── */}
            <div className="kp-doubledash-banner">
              <div className="kp-dd-left">
                <strong>⚡ DoubleDash: Forgot Milk, Curd or Dhaniya?</strong>
                <span>Add essentials in the next 10 minutes with ₹0 extra delivery fee!</span>
              </div>
              <button
                type="button"
                className="kp-dd-timer"
                style={{ cursor: 'pointer', border: '1px solid #93C5FD' }}
                onClick={() => navigate('/home')}
              >
                + Add Items (08:35)
              </button>
            </div>

            {/* Doorstep Delivery PIN & Live Security */}
            <div className="kp-order-pin-card">
              <div className="kp-order-pin-header">
                <span className="kp-pin-label">DOORSTEP DELIVERY PIN</span>
                <span className="kp-pin-code">{active.deliveryPin || '4829'}</span>
              </div>
              <p className="kp-pin-subtext">
                Share this 4-digit PIN with your rider only upon inspecting your fresh items and paying ₹{active.total} cash.
              </p>
              {active.codChangeRequestedFor && typeof active.codChangeRequestedFor === 'number' && (
                <div className="kp-order-change-alert">
                  ⚠️ Change requested for ₹{active.codChangeRequestedFor} (Rider bringing ₹{active.codChangeRequestedFor - active.total})
                </div>
              )}
            </div>

            {/* 5-Step Live Order Pipeline Tracker */}
            <div className="kp-order-tracker">
              <div className="kp-tracker-step completed">
                <span className="kp-step-dot">✓</span>
                <span className="kp-step-text">Order Confirmed</span>
              </div>
              <div className="kp-tracker-line completed" />
              <div className="kp-tracker-step active">
                <span className="kp-step-dot">🛵</span>
                <span className="kp-step-text">Rider Assigned</span>
              </div>
              <div className="kp-tracker-line" />
              <div className="kp-tracker-step">
                <span className="kp-step-dot">🌾</span>
                <span className="kp-step-text">Mandi Check</span>
              </div>
              <div className="kp-tracker-line" />
              <div className="kp-tracker-step">
                <span className="kp-step-dot">📦</span>
                <span className="kp-step-text">Out for Delivery</span>
              </div>
              <div className="kp-tracker-line" />
              <div className="kp-tracker-step">
                <span className="kp-step-dot">🏠</span>
                <span className="kp-step-text">Delivered (COD)</span>
              </div>
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
            {/* ── 2-Hour Post-Delivery Freshness Guarantee (Phase 9 Prompt 9.2) ── */}
            <div className="kp-freshness-guarantee-card" style={{ margin: '14px 0', padding: '14px', background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>🛡️ 2-Hour Freshness Guarantee</span>
                <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '6px', fontWeight: '750' }}>Active Guarantee Window</span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#14532D', margin: '0 0 10px', lineHeight: 1.45 }}>
                Not 100% satisfied with vegetable quality or weight? Report within 2 hours of delivery for an instant free replacement or COD credit.
              </p>
              <button
                type="button"
                style={{ width: '100%', padding: '9px', background: '#16A34A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                onClick={() => alert('Freshness Claim Recorded! Free replacement dispatched with next rider run (within 2 hours) or ₹50 Credit Note added to next COD basket.')}
              >
                Report Freshness / Weight Issue
              </button>
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
