import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Repeat, PauseCircle, PlayCircle, Check, Plus, Trash2, Sun, Sparkles } from 'lucide-react';

export default function SubscriptionsPage({ userLocation = 'Siripuram' }) {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'sub-1',
      name: 'Heritage Special Buffalo Milk (500 ml)',
      frequency: 'DAILY',
      quantity: 2,
      price: 36,
      slot: '6:00 AM – 7:30 AM',
      active: true
    },
    {
      id: 'sub-2',
      name: 'Fresh Morning Jasmine & Marigold Puja Flowers',
      frequency: 'DAILY',
      quantity: 1,
      price: 25,
      slot: '6:00 AM – 7:30 AM',
      active: true
    },
    {
      id: 'sub-3',
      name: 'Fresh Farm Curd (500 g Tub)',
      frequency: 'ALTERNATE_DAYS',
      quantity: 1,
      price: 42,
      slot: '6:00 AM – 7:30 AM',
      active: true
    }
  ]);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleRemoveSub = (id) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const dailyEstimate = subscriptions.reduce((sum, s) => sum + (s.price * s.quantity), 0);

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg-canvas, #F8F8F3)',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--brand-primary, #1E3A2B)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          type="button"
          onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Repeat size={18} color="#A7F3D0" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
              Daily Morning Subscriptions
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: '#A7F3D0' }}>
            6:00 AM – 7:30 AM Doorstep Drop • No Upfront Wallet Lock-in (COD)
          </span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Vacation / Out of Station Pause Card (Prompt 26.2) */}
        <div style={{
          background: isPaused ? '#FEF2F2' : 'var(--bg-surface, #FFFFFF)',
          borderRadius: '16px',
          padding: '16px',
          border: isPaused ? '1.5px solid #DC2626' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: isPaused ? '#DC2626' : '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isPaused ? <PauseCircle size={18} /> : <Sun size={18} color="#D97706" />}
              {isPaused ? "Deliveries Paused: You're Out of Station" : "Going Out of Station?"}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              {isPaused ? 'Resume before 10:00 PM to restart morning drop.' : "Tap pause before 10:00 PM to skip tomorrow's delivery."}
            </div>
          </div>

          <button
            type="button"
            onClick={handleTogglePause}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
              border: 'none',
              background: isPaused ? '#DC2626' : 'var(--brand-primary, #1E3A2B)',
              color: '#FFFFFF'
            }}
          >
            {isPaused ? 'Resume Deliveries' : 'Pause Tomorrow'}
          </button>
        </div>

        {/* Subscriptions List */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
              Active Recurring Morning Drops
            </h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857' }}>
              ~₹{dailyEstimate}/day
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                style={{
                  background: 'var(--bg-surface, #FFFFFF)',
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B' }}>
                    {sub.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '8px', marginTop: '3px' }}>
                    <span style={{ fontWeight: '700', color: '#047857' }}>{sub.frequency.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span>Qty: {sub.quantity}</span>
                    <span>•</span>
                    <span>₹{sub.price * sub.quantity}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSub(sub.id)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notice Card */}
        <div style={{
          background: 'var(--bg-subtle, #EEF2EB)',
          borderRadius: '14px',
          padding: '14px',
          fontSize: '12px',
          color: 'var(--brand-primary, #1E3A2B)',
          lineHeight: '1.45'
        }}>
          💡 <strong>How KiranaPRO Subscriptions Work:</strong> No advance monthly wallet recharge needed!
          Pay cash on delivery daily, or pay your rider once a week via Cash or UPI QR.
        </div>
      </div>
    </div>
  );
}
