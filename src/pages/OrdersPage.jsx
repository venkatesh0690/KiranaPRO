import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock, MapPin, Store, ChevronRight, PhoneCall, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState('JJ-434946736567');

  const orders = [
    {
      id: 'JJ-434946736567',
      date: 'Today, 5:40 PM',
      storeName: 'Sharma General Store',
      storeArea: 'Maddilapalem, Vizag',
      status: 'Active',
      statusColor: '#00A86B',
      eta: '11 mins',
      total: 245,
      items: [
        { name: 'Amul Taaza Toned Milk (1L)', qty: 2, price: 54 },
        { name: 'Hybrid Juicy Red Tomatoes (1kg)', qty: 1, price: 36 },
        { name: 'Haldiram’s Aloo Bhujia (200g)', qty: 1, price: 52 },
        { name: 'Britannia Whole Wheat Bread', qty: 1, price: 45 }
      ],
      steps: [
        { label: 'Order Placed', time: '5:40 PM', done: true },
        { label: 'Order Accepted by Sharma Kirana', time: '5:41 PM', done: true },
        { label: 'Rider Assigned (Suresh M. - TVS Jupiter)', time: '5:43 PM', done: true },
        { label: 'Out for Delivery (Nearby Kirana - Within 20 mins) to your door', time: 'ETA 5:58 PM (18 mins)', active: true },
        { label: 'Completed & Delivered', time: 'Pending', done: false }
      ]
    },
    {
      id: 'JJ-829103847192',
      date: 'Yesterday, 8:15 AM',
      storeName: 'Sri Lakshmi Provisions',
      storeArea: 'MVP Colony, Vizag',
      status: 'Completed',
      statusColor: '#6C757D',
      eta: 'Delivered in 22 min',
      total: 390,
      items: [
        { name: 'Tata Sampann Toor Dal (1kg)', qty: 1, price: 142 },
        { name: 'Fresh Farm Eggs (6 pcs)', qty: 2, price: 75 },
        { name: 'Heritage Thick Set Curd (450g)', qty: 1, price: 35 }
      ],
      steps: [
        { label: 'Order Placed', time: '8:15 AM', done: true },
        { label: 'Order Accepted', time: '8:16 AM', done: true },
        { label: 'Picked up from Store', time: '8:21 AM', done: true },
        { label: 'Delivered to Doorstep', time: '8:27 AM', done: true }
      ]
    }
  ];

  const currentOrder = orders.find((o) => o.id === selectedOrder) || orders[0];

  return (
    <div className="orders-page">
      {/* Top Header */}
      <div className="orders-header">
        <button type="button" className="orders-back-btn" onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="orders-title">Orders Tracking</h1>
        <button type="button" className="orders-refresh-btn" onClick={() => alert('Order status refreshed!')}>
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Active Live Stepper Banner (Directly from Screenshot 3's "Orders Summery") */}
      <div className="live-order-card">
        <div className="loc-top-row">
          <div>
            <span className="loc-order-id">Order ID: {currentOrder.id}</span>
            <div className="loc-store-line">
              <Store size={14} color="var(--brand)" />
              <span>{currentOrder.storeName}</span>
            </div>
          </div>
          <span className={`loc-status-pill ${currentOrder.status.toLowerCase()}`}>
            {currentOrder.status}
          </span>
        </div>

        {/* Live Stepper */}
        <div className="order-stepper">
          {currentOrder.steps.map((st, idx) => (
            <div key={st.label} className={`step-item ${st.done ? 'done' : ''} ${st.active ? 'active' : ''}`}>
              <div className="step-circle-track">
                <div className="step-circle">
                  {st.done ? (
                    <CheckCircle2 size={15} color="white" />
                  ) : st.active ? (
                    <div className="step-pulse-dot" />
                  ) : (
                    <span className="step-index">{idx + 1}</span>
                  )}
                </div>
                {idx < currentOrder.steps.length - 1 && <div className="step-line" />}
              </div>
              <div className="step-text">
                <span className="step-title">{st.label}</span>
                <span className="step-time">{st.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Rider & Delivery Note */}
        {currentOrder.status === 'Active' && (
          <div className="rider-contact-bar">
            <div className="rider-info">
              <div className="rider-avatar">🛵</div>
              <div>
                <span className="rider-name">Delivery Rider: Suresh M.</span>
                <span className="rider-sub">Arriving in approx {currentOrder.eta}</span>
              </div>
            </div>
            <button
              type="button"
              className="rider-call-btn"
              onClick={() => alert('Calling delivery partner Suresh M. (+91 98765 43210)')}
            >
              <PhoneCall size={15} />
              <span>Call</span>
            </button>
          </div>
        )}
      </div>

      {/* Orders List (Screenshot 3's "My Orders") */}
      <div className="my-orders-section">
        <h2 className="my-orders-heading">My Order History</h2>

        <div className="orders-list">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`order-summary-card ${selectedOrder === ord.id ? 'selected' : ''}`}
              onClick={() => setSelectedOrder(ord.id)}
            >
              <div className="osc-top">
                <div>
                  <span className="osc-id">{ord.id}</span>
                  <span className="osc-date">{ord.date}</span>
                </div>
                <span className={`osc-badge ${ord.status.toLowerCase()}`}>{ord.status}</span>
              </div>

              <div className="osc-items-preview">
                {ord.items.map((it) => (
                  <div key={it.name} className="osc-item-line">
                    <span className="osc-item-name">{it.name}</span>
                    <span className="osc-item-calc">Qty {it.qty} • ₹{it.price * it.qty}</span>
                  </div>
                ))}
              </div>

              <div className="osc-bottom">
                <span className="osc-total-label">Total Amount Paid</span>
                <span className="osc-total-val">₹{ord.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
