import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bike, CheckCircle2, MapPin, Phone, ExternalLink, AlertTriangle, 
  DollarSign, ClipboardList, Shield, ArrowLeft, RefreshCw, Sparkles, Navigation 
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export default function RiderPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authSession, logout } = useSecurity();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState('deliveries'); // 'deliveries' | 'mandi' | 'ledger'
  const [unsettledCash, setUnsettledCash] = useState(1480);
  const [selectedZone, setSelectedZone] = useState('Siripuram');

  // Sample Assigned Deliveries
  const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
  const [rejectedItems, setRejectedItems] = useState({});
  const [rejectionReason, setRejectionReason] = useState('Quality Issue');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Web Audio API notification chime (Phase 12 Prompt 12.1)
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [deliveries, setDeliveries] = useState([
    {
      id: 'KP-ORD-8821',
      orderNumber: 1042,
      customerName: 'Priya Sharma',
      customerPhone: '+91 98480 11223',
      area: 'Siripuram',
      address: 'Flat 402, Sea View Apartments, Near Sampath Vinayaka Temple, Siripuram, Visakhapatnam',
      pickupSource: 'LocalFresh Mandi Hub',
      isMandi: true,
      status: 'Out for Delivery', // 'New Assigned' | 'At Pickup' | 'Out for Delivery' | 'Delivered'
      items: [
        { name: 'Fresh Tomatoes 1kg', qty: 2, unit: 'kg', checked: true },
        { name: 'Potols (Pointed Gourd)', qty: 1, unit: 'kg', checked: true },
        { name: 'Lady Finger / Bhindi', qty: 1, unit: 'kg', checked: true }
      ],
      totalToPay: 184,
      changeRequestedFor: 200,
      deliveryPin: '4829',
      collectedCash: false,
      enteredPin: '',
      deliveredAt: null
    },
    {
      id: 'KP-ORD-8824',
      orderNumber: 1043,
      customerName: 'K. Venkatesh',
      customerPhone: '+91 98480 33445',
      area: 'Siripuram',
      address: 'House #12-4-8, Waltair Uplands, Siripuram, Visakhapatnam',
      pickupSource: 'Siripuram Daily Basket',
      isMandi: false,
      status: 'At Pickup',
      items: [
        { name: 'Heritage Full Cream Milk 500ml', qty: 2, unit: 'packet', checked: false },
        { name: 'Tata Sampann Toor Dal 1kg', qty: 1, unit: 'pack', checked: false }
      ],
      totalToPay: 210,
      changeRequestedFor: null,
      deliveryPin: '7192',
      collectedCash: false,
      enteredPin: '',
      deliveredAt: null
    }
  ]);

  // Mandi Field Reports State
  const [mandiItems, setMandiItems] = useState([
    { id: 'm1', name: 'Country Tomatoes (Naatu Tamata)', observedPrice: 22, stockStatus: 'Plenty (50+ kg)', grade: 'Grade A Fresh', notes: 'Crisp morning arrival from Anakapalle' },
    { id: 'm2', name: 'Lady Finger (Bendakaya)', observedPrice: 26, stockStatus: 'Plenty (50+ kg)', grade: 'Grade A Fresh', notes: 'Small tender batch, ideal for fry' },
    { id: 'm3', name: 'Yellow Cucumber (Dosakaya)', observedPrice: 18, stockStatus: 'Limited (10-20 kg)', grade: 'Standard', notes: 'Firm golden harvest' },
    { id: 'm4', name: 'Ash Gourd (Boodida Gummadikaya)', observedPrice: 32, stockStatus: 'Plenty (50+ kg)', grade: 'Grade A Fresh', notes: 'Heavy whole pieces' },
    { id: 'm5', name: 'Palak / Spinach Bunches', observedPrice: 12, stockStatus: 'Limited (10-20 kg)', grade: 'Standard', notes: 'Very fresh leaves, harvested 4 AM' }
  ]);
  const [mandiReportSubmitted, setMandiReportSubmitted] = useState(false);

  // Toggle item check on pickup
  const toggleItemCheck = (orderId, itemIndex) => {
    setDeliveries(prev => prev.map(ord => {
      if (ord.id !== orderId) return ord;
      const nextItems = [...ord.items];
      nextItems[itemIndex] = { ...nextItems[itemIndex], checked: !nextItems[itemIndex].checked };
      return { ...ord, items: nextItems };
    }));
  };

  // Doorstep Partial COD Rejection Handler (Phase 9 Prompt 9.1)
  const handleApplyDoorstepAdjustment = () => {
    if (!rejectionModalOrder) return;
    const orderId = rejectionModalOrder.id;
    let deduction = 0;
    const updatedDeliveries = deliveries.map(ord => {
      if (ord.id !== orderId) return ord;
      const updatedItems = ord.items.map((it, idx) => {
        if (rejectedItems[idx]) {
          deduction += (it.price || 35) * (rejectedItems[idx] || 1);
          return { ...it, rejected: true, rejectReason: rejectionReason };
        }
        return it;
      });
      const newTotal = Math.max(0, ord.totalToPay - deduction);
      return { ...ord, items: updatedItems, totalToPay: newTotal, doorstepAdjusted: true };
    });
    setDeliveries(updatedDeliveries);
    playChime();
    alert(`COD bill adjusted on doorstep! Deducted ₹${deduction}. New amount to collect: ₹${Math.max(0, rejectionModalOrder.totalToPay - deduction)}`);
    setRejectionModalOrder(null);
    setRejectedItems({});
  };

  // 1-Tap WhatsApp Update (Phase 12 Prompt 12.1)
  const handleSendWhatsAppUpdate = (ord) => {
    const phone = (ord.customerPhone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${ord.customerName}, your KiranaPRO rider is arriving shortly with Order #${ord.orderNumber}.\n\nTotal COD to Pay: ₹${ord.totalToPay}\nDoorstep Delivery PIN: ${ord.deliveryPin}\n\nPlease inspect your fresh items at doorstep before sharing your PIN!`
    );
    window.open(`https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${text}`, '_blank');
  };

  // Complete COD Handover with PIN verification
  const handleCompleteDelivery = (orderId) => {
    const order = deliveries.find(d => d.id === orderId);
    if (!order) return;
    if (!order.collectedCash) {
      alert(`Please verify cash collection of ₹${order.totalToPay} before completing!`);
      return;
    }
    if (order.enteredPin.trim() !== order.deliveryPin) {
      alert(`Incorrect Delivery PIN! Please ask customer for their 4-digit PIN shown on their KiranaPRO order tracker.`);
      return;
    }

    setDeliveries(prev => prev.map(d => d.id === orderId ? { ...d, status: 'Delivered', deliveredAt: new Date().toLocaleTimeString('en-IN') } : d));
    setUnsettledCash(prev => prev + order.totalToPay);
    alert(`🎉 Order #${order.orderNumber} successfully delivered & ₹${order.totalToPay} COD collected!`);
  };

  // Submit Mandi Inspection Report to Admin
  const handleSubmitMandiReport = () => {
    setMandiReportSubmitted(true);
    setTimeout(() => {
      alert(`🌾 Mandi Inspection Report for Visakhapatnam Wholesale Hub successfully submitted to Admin Console for price publishing!`);
    }, 400);
  };

  return (
    <div className="kp-rider-portal">
      {/* Top Shift Status Bar */}
      <header className="kp-rider-header">
        <div className="kp-rider-top-row">
          <div className="kp-rider-profile">
            <span className="kp-rider-avatar"><Bike size={18} /></span>
            <div>
              <h2 className="kp-rider-name">Rider Rajesh (Fleet #Vizag-04)</h2>
              <span className="kp-rider-zone"><MapPin size={12} /> Zone: {selectedZone} (Vizag)</span>
            </div>
          </div>
          <button 
            type="button" 
            className={`kp-duty-toggle ${isOnDuty ? 'on' : 'off'}`}
            onClick={() => setIsOnDuty(d => !d)}
          >
            {isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
          </button>
        </div>

        {/* Live Cash In Hand Pill */}
        <div className="kp-rider-cash-pill">
          <span className="krc-label">Cash in Hand (Unsettled COD):</span>
          <strong className="krc-amount">₹{unsettledCash}</strong>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="kp-rider-tabs">
        <button 
          type="button" 
          className={`kp-rider-tab ${activeTab === 'deliveries' ? 'active' : ''}`}
          onClick={() => setActiveTab('deliveries')}
        >
          <ClipboardList size={16} /> Active Deliveries ({deliveries.filter(d => d.status !== 'Delivered').length})
        </button>
        <button 
          type="button" 
          className={`kp-rider-tab ${activeTab === 'mandi' ? 'active' : ''}`}
          onClick={() => setActiveTab('mandi')}
        >
          🌾 Mandi Check
        </button>
        <button 
          type="button" 
          className={`kp-rider-tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <DollarSign size={16} /> Cash Ledger
        </button>
        <button 
          type="button" 
          className={`kp-rider-tab ${activeTab === 'procurement' ? 'active' : ''}`}
          onClick={() => setActiveTab('procurement')}
        >
          🌅 Morning Bulk Sheet
        </button>
      </div>

      {/* Tab 1: Active Deliveries */}
      {activeTab === 'deliveries' && (
        <div className="kp-rider-content">
          <h3 className="kp-section-heading">Assigned Deliveries for Today</h3>
          {deliveries.map(ord => (
            <div key={ord.id} className={`kp-delivery-card ${ord.status === 'Delivered' ? 'is-delivered' : ''}`}>
              <div className="kdc-header">
                <div>
                  <span className="kdc-order-tag">Order #{ord.orderNumber} • {ord.id}</span>
                  <h4 className="kdc-customer">{ord.customerName}</h4>
                </div>
                <span className={`kdc-status-badge ${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {ord.status}
                </span>
              </div>

              {/* Source Badge */}
              <div className="kdc-source-pill">
                {ord.isMandi ? '🌾 Mandi Hub Pickup (LocalFresh)' : `🏪 Kirana Pickup (${ord.pickupSource})`}
              </div>

              {/* Address with Google Maps Link */}
              <div className="kdc-address-box">
                <MapPin size={15} className="kdc-pin-icon" />
                <span>{ord.address}</span>
              </div>
              <div className="kdc-actions-row">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(ord.address)}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="kdc-map-btn"
                >
                  <Navigation size={14} /> Open in Google Maps
                </a>
                <a href={`tel:${ord.customerPhone}`} className="kdc-call-btn">
                  <Phone size={14} /> Call Customer
                </a>
              </div>

              {/* Pickup Checklist */}
              {ord.status !== 'Delivered' && (
                <div className="kdc-checklist">
                  <h5 className="kdc-checklist-title">Verify Items Before Leaving Pickup:</h5>
                  {ord.items.map((item, idx) => (
                    <label key={idx} className="kdc-item-row">
                      <input 
                        type="checkbox" 
                        checked={item.checked} 
                        onChange={() => toggleItemCheck(ord.id, idx)} 
                      />
                      <span className={item.checked ? 'item-checked' : ''}>
                        {item.name} ({item.qty} {item.unit})
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* COD Collection Banner */}
              <div className="kdc-cod-banner">
                <span className="kdc-cod-bold">COLLECT ₹{ord.totalToPay} CASH ON DELIVERY</span>
                {ord.changeRequestedFor && (
                  <div className="kdc-change-alert">
                    <AlertTriangle size={14} />
                    <span>Customer requested change for ₹{ord.changeRequestedFor} (Bring ₹{ord.changeRequestedFor - ord.totalToPay} change)</span>
                  </div>
                )}
              </div>

              {/* Doorstep Delivery Verification */}
              {ord.status !== 'Delivered' ? (
                <div className="kdc-completion-box">
                  <label className="kdc-cash-collected-check">
                    <input 
                      type="checkbox" 
                      checked={ord.collectedCash} 
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDeliveries(prev => prev.map(d => d.id === ord.id ? { ...d, collectedCash: checked } : d));
                      }} 
                    />
                    <span>Collected ₹{ord.totalToPay} cash from customer at doorstep</span>
                  </label>

                  <div className="kdc-pin-input-row">
                    <label>Enter 4-Digit Customer PIN:</label>
                    <input 
                      type="text" 
                      maxLength={4} 
                      placeholder="e.g. 4829" 
                      value={ord.enteredPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setDeliveries(prev => prev.map(d => d.id === ord.id ? { ...d, enteredPin: val } : d));
                      }}
                    />
                    <button 
                      type="button" 
                      className="kdc-complete-btn"
                      onClick={() => handleCompleteDelivery(ord.id)}
                    >
                      Verify & Deliver
                    </button>
                  </div>
                </div>
              ) : (
                <div className="kdc-delivered-stamp">
                  <CheckCircle2 size={16} /> Delivered & ₹{ord.totalToPay} COD collected at {ord.deliveredAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Mandi Field Inspection Reporting */}
      {activeTab === 'mandi' && (
        <div className="kp-rider-content">
          <div className="kp-mandi-intro">
            <h3>🌾 Morning Mandi Ground Inspection</h3>
            <p>Report live wholesale mandi prices & stock availability directly to the Admin Console for immediate publishing on LocalFresh.</p>
          </div>

          <div className="kp-mandi-table-wrap">
            {mandiItems.map((item, idx) => (
              <div key={item.id} className="kp-mandi-item-card">
                <div className="kmic-head">
                  <strong>{item.name}</strong>
                  <span className="kmic-grade-pill">{item.grade}</span>
                </div>

                <div className="kmic-inputs-grid">
                  <div className="kmic-field">
                    <label>Wholesale Rate (₹/kg):</label>
                    <input 
                      type="number" 
                      value={item.observedPrice} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMandiItems(prev => prev.map((m, i) => i === idx ? { ...m, observedPrice: val } : m));
                      }}
                    />
                  </div>

                  <div className="kmic-field">
                    <label>Stock Availability:</label>
                    <select 
                      value={item.stockStatus}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMandiItems(prev => prev.map((m, i) => i === idx ? { ...m, stockStatus: val } : m));
                      }}
                    >
                      <option value="Plenty (50+ kg)">Plenty (50+ kg)</option>
                      <option value="Limited (10-20 kg)">Limited (10-20 kg)</option>
                      <option value="Unavailable Today">Unavailable Today</option>
                    </select>
                  </div>
                </div>

                <div className="kmic-notes-field">
                  <label>Rider Quality Note:</label>
                  <input 
                    type="text" 
                    value={item.notes} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setMandiItems(prev => prev.map((m, i) => i === idx ? { ...m, notes: val } : m));
                    }}
                  />
                </div>
              </div>
            ))}

            <button 
              type="button" 
              className="kp-submit-mandi-btn"
              onClick={handleSubmitMandiReport}
            >
              {mandiReportSubmitted ? '✓ Report Submitted to Admin' : 'Submit Mandi Report to Admin Console'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: COD Cash Settlement Ledger */}
      {activeTab === 'ledger' && (
        <div className="kp-rider-content">
          <div className="kp-ledger-summary-card">
            <span className="klsc-title">Total Cash in Hand</span>
            <h2 className="klsc-amount">₹{unsettledCash}</h2>
            <p className="klsc-sub">Unsettled COD cash collected from doorstep deliveries. Hand over to Admin at shift close.</p>
          </div>

          <h4 className="kp-ledger-history-heading">Today's Collected Orders</h4>
          <div className="kp-ledger-list">
            <div className="kp-ledger-item">
              <div>
                <strong>Order #1040 (Siripuram)</strong>
                <span>Collected from Mr. Rao</span>
              </div>
              <strong className="kld-amt">₹320</strong>
            </div>
            <div className="kp-ledger-item">
              <div>
                <strong>Order #1038 (Siripuram)</strong>
                <span>Collected from S. Lakshmi</span>
              </div>
              <strong className="kld-amt">₹480</strong>
            </div>
            <div className="kp-ledger-item">
              <div>
                <strong>Order #1035 (Siripuram)</strong>
                <span>Collected from K. Murthy</span>
              </div>
              <strong className="kld-amt">₹680</strong>
            </div>
          </div>

          <div className="kp-ledger-settle-notice">
            <Shield size={16} />
            <span>Shift settlement requires Admin physical cash count verification and UTR confirmation.</span>
          </div>
        </div>
      )}

      {/* Bottom Back Button */}
      <footer className="kp-rider-footer">
        <button type="button" onClick={() => navigate('/home')}>
          <ArrowLeft size={16} /> Back to Customer Storefront
        </button>
      </footer>
      {/* Tab 4: Morning Mandi Bulk Procurement Sheet (Phase 10 Prompt 10.1) */}
      {activeTab === 'procurement' && (
        <div className="kp-rider-content">
          <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#92400E' }}>🌅 5:00 AM Consolidated Mandi Procurement Sheet</strong>
            <span style={{ fontSize: '11px', color: '#B45309' }}>Aggregated overnight pre-orders for Visakhapatnam morning drop (6 AM–8 AM)</span>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '10px' }}>Item Name</th>
                  <th style={{ padding: '10px' }}>Total Needed</th>
                  <th style={{ padding: '10px' }}>Max Target Price</th>
                  <th style={{ padding: '10px' }}>Mandi Source</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px', fontWeight: '750' }}>Naatu Tomatoes</td>
                  <td style={{ padding: '10px' }}>18 kg</td>
                  <td style={{ padding: '10px', color: '#16A34A', fontWeight: '750' }}>₹22/kg</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>Anakapalle Belt</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px', fontWeight: '750' }}>Bendakaya (Bhindi)</td>
                  <td style={{ padding: '10px' }}>12 kg</td>
                  <td style={{ padding: '10px', color: '#16A34A', fontWeight: '750' }}>₹26/kg</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>Chodavaram Lot</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px', fontWeight: '750' }}>Potols (Pointed Gourd)</td>
                  <td style={{ padding: '10px' }}>8 kg</td>
                  <td style={{ padding: '10px', color: '#16A34A', fontWeight: '750' }}>₹32/kg</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>Local Mandi Direct</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', fontWeight: '750' }}>Palak Bunches</td>
                  <td style={{ padding: '10px' }}>24 bunches</td>
                  <td style={{ padding: '10px', color: '#16A34A', fontWeight: '750' }}>₹12/bunch</td>
                  <td style={{ padding: '10px', color: '#64748B' }}>Pendurthi Fresh Lot</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doorstep Partial COD Rejection Modal (Phase 9 Prompt 9.1) */}
      {rejectionModalOrder && (
        <div className="kp-modal-overlay">
          <div className="kp-modal-card">
            <h3>⚠️ Adjust COD at Doorstep</h3>
            <p>Select any item the customer rejected upon inspection to deduct it from their COD bill:</p>
            <div>
              {rejectionModalOrder.items.map((it, idx) => (
                <div key={idx} className="kp-rejection-row">
                  <div className="kp-rejection-info">
                    <strong>{it.name} ({it.qty} {it.unit})</strong>
                    <span>₹{it.price || 35} per unit</span>
                  </div>
                  <button
                    type="button"
                    style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px', border: '1px solid #CBD5E1', background: rejectedItems[idx] ? '#FEE2E2' : '#F8FAFC', color: rejectedItems[idx] ? '#991B1B' : '#334155', fontWeight: '750', cursor: 'pointer' }}
                    onClick={() => setRejectedItems(prev => ({ ...prev, [idx]: prev[idx] ? null : 1 }))}
                  >
                    {rejectedItems[idx] ? '❌ Item Rejected' : 'Accept Item'}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '750', color: '#334155' }}>Select Rejection Reason:</span>
              <div className="kp-reason-pills">
                {['Quality Issue', 'Customer Changed Mind', 'Damaged in Transit'].map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`kp-reason-pill ${rejectionReason === r ? 'selected' : ''}`}
                    onClick={() => setRejectionReason(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="kp-modal-actions">
              <button type="button" className="kp-modal-btn cancel" onClick={() => setRejectionModalOrder(null)}>Cancel</button>
              <button type="button" className="kp-modal-btn confirm" onClick={handleApplyDoorstepAdjustment}>Update COD Total</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
