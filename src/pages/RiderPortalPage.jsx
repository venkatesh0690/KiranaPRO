import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bike, CheckCircle2, MapPin, Phone, ExternalLink, AlertTriangle, 
  DollarSign, ClipboardList, Shield, ArrowLeft, RefreshCw, Sparkles, Navigation,
  QrCode, Award, Truck, AlertOctagon, Check, Bell
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { getBatchBagTag, sortItemsByPackingLayer, categorizeItemPackingLayer } from '../utils/addressAndGate';
import { generateDoorstepUpiUri, addChillarBalance } from '../utils/chillarKhata';
import { getRiderEarningsScorecard } from '../utils/rainModeAndFleet';

export default function RiderPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authSession, logout } = useSecurity();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [sunlightMode, setSunlightMode] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('kp_sunlight_mode') === 'true';
  });

  const toggleSunlightMode = () => {
    setSunlightMode(prev => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') localStorage.setItem('kp_sunlight_mode', String(next));
      return next;
    });
  };
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
    <div className={`kp-rider-portal ${sunlightMode ? "kp-sunlight-mode" : ""}`}>

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              className={`kp-duty-toggle ${sunlightMode ? 'on' : 'off'}`}
              onClick={toggleSunlightMode}
              title="Ultra-high contrast daylight visibility for wholesale mandis"
            >
              {sunlightMode ? '☀️ Sunlight: ON' : '🌤️ Sunlight: OFF'}
            </button>
            <button 
              type="button" 
              className={`kp-duty-toggle ${isOnDuty ? 'on' : 'off'}`}
              onClick={() => setIsOnDuty(d => !d)}
            >
              {isOnDuty ? '🟢 On Duty' : '⚪ Off Duty'}
            </button>
          </div>
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
        <button 
          type="button" 
          className={`kp-rider-tab ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <Award size={16} /> Earnings & Scorecard
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

              {/* Source Badge & Batch Color Tag (Prompts 20.3 & 20.1) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', margin: '6px 0 10px' }}>
                <div className="kdc-source-pill" style={{ margin: 0 }}>
                  {ord.isMandi ? '🌾 Mandi Hub Pickup (LocalFresh)' : `🏪 Kirana Pickup (${ord.pickupSource})`}
                </div>
                <div style={{
                  background: getBatchBagTag(deliveries.indexOf(ord)).bg,
                  border: `1.5px solid ${getBatchBagTag(deliveries.indexOf(ord)).border}`,
                  color: getBatchBagTag(deliveries.indexOf(ord)).hex,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  {getBatchBagTag(deliveries.indexOf(ord)).name}
                </div>
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

              {/* Emergency Vehicle Issue & Reached Gate Row */}
              {ord.status !== 'Delivered' && (
                <div style={{ display: 'flex', gap: '8px', margin: '10px 0' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveries(prev => prev.map(d => d.id === ord.id ? { ...d, arrivedAt: true } : d));
                      alert(`🚨 "Reached Customer Gate" alert sent to customer! 5-Minute Handover Timer started.`);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      background: ord.arrivedAt ? '#ECFDF5' : '#FFFBEB',
                      border: ord.arrivedAt ? '1.5px solid #10B981' : '1.5px solid #D97706',
                      borderRadius: '8px',
                      color: ord.arrivedAt ? '#047857' : '#B45309',
                      fontWeight: '800',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Bell size={13} />
                    {ord.arrivedAt ? 'At Customer Gate (Timer: 04:32)' : '🚨 Reached Customer Gate'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`🚨 Emergency Relief Request sent to Visakhapatnam Dispatch for Order #${ord.orderNumber}. Backup rider being assigned!`);
                    }}
                    style={{
                      padding: '8px 10px',
                      background: '#FEF2F2',
                      border: '1.5px solid #DC2626',
                      borderRadius: '8px',
                      color: '#DC2626',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                    title="Vehicle Issue / Need Relief Rider"
                  >
                    Vehicle Issue?
                  </button>
                </div>
              )}

              {/* Instacart 3-Layer Bag-Smart Packing Checklist (Prompt 20.1) */}
              {ord.status !== 'Delivered' && (
                <div className="kdc-checklist">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h5 className="kdc-checklist-title" style={{ margin: 0 }}>
                      Bag-Smart Packing Order (Instacart 3-Layer):
                    </h5>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>Heavy bottom, fragile top</span>
                  </div>

                  {/* Layer 3 Warning if fragile items exist */}
                  <div style={{
                    padding: '6px 10px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    fontSize: '10.5px',
                    color: '#DC2626',
                    fontWeight: '700',
                    marginBottom: '8px'
                  }}>
                    ⚠️ Pack Tomatoes & Greens on VERY TOP so items are never bruised during transit!
                  </div>

                  {sortItemsByPackingLayer(ord.items).map((item, idx) => {
                    const layerInfo = categorizeItemPackingLayer(item);
                    return (
                      <label key={idx} className="kdc-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={item.checked} 
                            onChange={() => toggleItemCheck(ord.id, idx)} 
                          />
                          <span className={item.checked ? 'item-checked' : ''}>
                            {item.name} ({item.qty} {item.unit})
                          </span>
                        </div>
                        <span style={{ fontSize: '9.5px', color: layerInfo.color, fontWeight: '800', background: '#F8FAFC', padding: '2px 6px', borderRadius: '4px' }}>
                          {layerInfo.tag}
                        </span>
                      </label>
                    );
                  })}
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

              {/* Doorstep Delivery Verification (Prompts 20.3, 29.1, 29.2) */}
              {ord.status !== 'Delivered' ? (
                <div className="kdc-completion-box">
                  {/* Verified Bag Tag Check */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: getBatchBagTag(deliveries.indexOf(ord)).hex, marginBottom: '10px' }}>
                    <input
                      type="checkbox"
                      checked={ord.verifiedBagTag || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDeliveries(prev => prev.map(d => d.id === ord.id ? { ...d, verifiedBagTag: checked } : d));
                      }}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Verified {getBatchBagTag(deliveries.indexOf(ord)).name} before knocking</span>
                  </label>

                  {/* Payment Collection: Cash vs UPI QR */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setDeliveries(prev => prev.map(d => d.id === ord.id ? { ...d, payMode: 'CASH', collectedCash: true } : d))}
                      style={{
                        padding: '8px',
                        background: ord.payMode !== 'UPI' ? '#1E3A2B' : '#F1F5F9',
                        color: ord.payMode !== 'UPI' ? '#FFF' : '#334155',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      💵 Collected Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveries(prev => prev.map(d => d.id === ord.id ? { ...d, payMode: 'UPI', collectedCash: true } : d))}
                      style={{
                        padding: '8px',
                        background: ord.payMode === 'UPI' ? '#1E3A2B' : '#F1F5F9',
                        color: ord.payMode === 'UPI' ? '#FFF' : '#334155',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      📱 Doorstep UPI QR
                    </button>
                  </div>

                  {ord.payMode === 'UPI' && (
                    <div style={{ padding: '12px', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '10px', textAlign: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#1E3A2B', marginBottom: '4px' }}>
                        Customer Doorstep UPI QR (₹{ord.totalToPay})
                      </div>
                      <div style={{ width: '110px', height: '110px', background: '#F8FAFC', border: '1px solid #E2E8F0', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={90} color="#1E3A2B" />
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>
                        Scan via PhonePe, GPay, Paytm or BHIM
                      </span>
                    </div>
                  )}

                  {/* Chillar Khata Loose Change Deposit (Prompt 29.2) */}
                  <div style={{ padding: '8px 10px', background: '#FFFBEB', border: '1px dashed #D97706', borderRadius: '8px', marginBottom: '10px', fontSize: '11px' }}>
                    <div style={{ fontWeight: '800', color: '#B45309', marginBottom: '4px' }}>
                      💡 No loose coins? Save change to Customer's Chillar Khata:
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[200, 500].map(note => {
                        const change = note - ord.totalToPay;
                        if (change <= 0 || change > 50) return null;
                        return (
                          <button
                            key={note}
                            type="button"
                            onClick={() => {
                              addChillarBalance(change);
                              alert(`💡 ₹${change} credited to Customer's Chillar Khata wallet!`);
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#FFFFFF',
                              border: '1px solid #D97706',
                              borderRadius: '6px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              color: '#B45309',
                              cursor: 'pointer'
                            }}
                          >
                            ₹{note} note → Save ₹{change} change
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

      {/* Tab 5: Rider Earnings & Quality Scorecard (Prompt 27.2) */}
      {activeTab === 'earnings' && (
        <div className="kp-rider-content">
          <h3 className="kp-section-heading">My Fleet Earnings & Performance Scorecard</h3>
          
          {/* Daily Scorecard Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1.5px solid #CBD5E1' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>TODAY'S PAYOUT</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#16A34A', marginTop: '2px' }}>₹770</div>
              <div style={{ fontSize: '10px', color: '#047857', marginTop: '2px' }}>₹560 base + ₹140 rain + ₹70 tips</div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1.5px solid #CBD5E1' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>CUSTOMER RATING</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>4.9 ⭐</div>
              <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>14 delivered · 98% on-time</div>
            </div>
          </div>

          {/* Quality Streak Banner */}
          <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '800', fontSize: '13px' }}>
              <Award size={18} />
              <span>Zero Damaged Produce Streak: 18 Days!</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#14532D', lineHeight: 1.45 }}>
              Thanks to your Instacart 3-Layer packing care, zero produce crushing claims were reported in Siripuram zone this month. Keep it up!
            </p>
          </div>

          {/* COD Settlement Threshold Card */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B' }}>COD Cash in Hand vs Limit</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#16A34A' }}>₹{unsettledCash} / ₹5,000</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(unsettledCash / 5000) * 100}%`, height: '100%', background: '#16A34A' }} />
            </div>
            <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginTop: '6px' }}>
              Hand over cash to Admin at Siripuram Hub before 9:00 PM tonight.
            </span>
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
