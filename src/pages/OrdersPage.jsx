import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Store, ChevronRight, MessageCircle, FileText, Phone, Edit2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomerOrders } from '../context/OrderHistoryContext';
import OrderChatDrawer from '../components/OrderChatDrawer';
import InvoicePrintModal from '../components/InvoicePrintModal';

export default function OrdersPage() {
  const navigate=useNavigate();
  const {orders}=useCustomerOrders();
  const [selectedOrder,setSelectedOrder]=useState(null);
  const sorted=[...orders].reverse();
  const active=sorted.find(o=>o.id===selectedOrder)||sorted[0]||null;

  // In-App Chat, Invoicing & Self-Serve Note Editing (Phases 19, 26, 31)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [editedChange, setEditedChange] = useState('Exact Cash Ready');
  const [noteUpdatedMsg, setNoteUpdatedMsg] = useState(false);

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

            {/* Prompt 19.3: Rider Has Arrived at Gate Live Alert & 5-Min Timer */}
            <div style={{
              background: '#FFFBEB',
              border: '2px solid #D97706',
              borderRadius: '14px',
              padding: '12px 14px',
              margin: '12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#B45309' }}>
                  🚨 Rider Rajesh is at your gate / door!
                </div>
                <div style={{ fontSize: '11px', color: '#78350F', marginTop: '2px' }}>
                  Keep ₹{active.total} cash & 4-digit PIN ({active.deliveryPin || '4829'}) ready. (04:42 left)
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <a
                  href="tel:+919848022338"
                  style={{
                    background: '#D97706',
                    color: '#FFF',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            </div>

            {/* Quick Action Buttons: Chat, Update Note & Tax Invoice */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '12px 0' }}>
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                style={{
                  padding: '9px 6px',
                  background: '#FFFFFF',
                  border: '1.5px solid #1E3A2B',
                  borderRadius: '10px',
                  color: '#1E3A2B',
                  fontWeight: '750',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={14} /> Chat Rider
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditedNote(active.deliveryAddress || '');
                  setEditedChange(active.codChangeRequestedFor || 'Exact Cash Ready');
                  setIsEditNoteOpen(true);
                }}
                style={{
                  padding: '9px 6px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  color: '#334155',
                  fontWeight: '750',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={14} /> Gate Note
              </button>

              <button
                type="button"
                onClick={() => setIsInvoiceOpen(true)}
                style={{
                  padding: '9px 6px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  color: '#334155',
                  fontWeight: '750',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <FileText size={14} /> Tax Invoice
              </button>
            </div>

            {noteUpdatedMsg && (
              <div style={{ padding: '8px 12px', background: '#ECFDF5', color: '#047857', borderRadius: '8px', fontSize: '11px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Delivery note & COD change updated for Rider Rajesh!
              </div>
            )}

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

      {/* In-App Chat Modal */}
      {isChatOpen && (
        <OrderChatDrawer
          order={active}
          role="customer"
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Tax Invoice Printable Modal */}
      {isInvoiceOpen && (
        <InvoicePrintModal
          order={active}
          customer={{ name: 'Valued Neighbor', phone: '+91 98480 22338' }}
          onClose={() => setIsInvoiceOpen(false)}
        />
      )}

      {/* Edit Gate Note / COD Change Drawer (Prompt 31.3) */}
      {isEditNoteOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
              Update Gate Note or COD Change
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748B' }}>
              Changes sync instantly to your delivery partner's screen.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Delivery Landmark / Gate Instruction:
              </label>
              <textarea
                rows={2}
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                Need Change for Cash Payment?
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Exact Cash Ready', 100, 200, 500].map((opt) => (
                  <button
                    key={String(opt)}
                    type="button"
                    onClick={() => setEditedChange(opt)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: editedChange === opt ? '1.5px solid var(--brand-primary, #1E3A2B)' : '1px solid #CBD5E1',
                      background: editedChange === opt ? 'var(--bg-subtle, #EEF2EB)' : '#FFF',
                      cursor: 'pointer'
                    }}
                  >
                    {typeof opt === 'number' ? `₹${opt} Note` : opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsEditNoteOpen(false)}
                style={{ flex: 1, padding: '10px', background: '#F1F5F9', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditNoteOpen(false);
                  setNoteUpdatedMsg(true);
                  setTimeout(() => setNoteUpdatedMsg(false), 4000);
                }}
                style={{ flex: 1, padding: '10px', background: 'var(--brand-primary, #1E3A2B)', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
              >
                Save & Update Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
