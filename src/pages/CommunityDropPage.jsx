import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Sparkles, Clock, Truck, Share2, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CommunityDropPage({ userLocation = 'Siripuram' }) {
  const navigate = useNavigate();
  const [hasCopied, setHasCopied] = useState(false);

  // Community Group Drop State for the user's neighborhood
  const groupDrop = {
    societyName: userLocation === 'Siripuram' ? 'Siripuram Heights & Balaji Enclave' : `${userLocation} Resident Apartments`,
    targetOrders: 10,
    currentOrders: 8,
    cutoffTime: '5:00 PM IST',
    deliveryWindow: '6:30 PM – 7:30 PM',
    discountUnlocked: '10% EXTRA WHOLESALE OFF',
    freeDelivery: true,
    hoursLeft: '02h : 18m'
  };

  const percentComplete = Math.min(100, Math.round((groupDrop.currentOrders / groupDrop.targetOrders) * 100));

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌾 Neighbors of ${groupDrop.societyName}! Join today's KiranaPRO Evening Mandi Truck Drop.\n\nOnly ${groupDrop.targetOrders - groupDrop.currentOrders} more orders needed before 5:00 PM to unlock ₹0 DELIVERY + Extra 10% Wholesale Discount for everyone!\n\nOrder here: https://kiranapro-two.vercel.app/community-drop`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg-canvas, #F8F8F3)',
      paddingBottom: '80px'
    }}>
      {/* Top Header */}
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
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
            Apartment Community Mandi Drop
          </h2>
          <span style={{ fontSize: '11px', color: '#A7F3D0' }}>
            Hyperlocal group buying for {userLocation} societies
          </span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Progress Card */}
        <div style={{
          background: 'var(--bg-surface, #FFFFFF)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{
              background: '#ECFDF5',
              color: '#047857',
              fontSize: '11px',
              fontWeight: '800',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={13} /> GROUP BUY ACTIVE
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Clock size={13} /> Cutoff in {groupDrop.hoursLeft}
            </span>
          </div>

          <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '900', color: 'var(--brand-primary, #1E3A2B)' }}>
            {groupDrop.societyName}
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B' }}>
            Dedicated direct-from-Mandi truck drop today between <strong>{groupDrop.deliveryWindow}</strong>.
          </p>

          {/* Progress Bar */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
              <span style={{ color: 'var(--brand-primary, #1E3A2B)' }}>
                {groupDrop.currentOrders} of {groupDrop.targetOrders} Neighbors Joined
              </span>
              <span style={{ color: '#047857' }}>
                {groupDrop.targetOrders - groupDrop.currentOrders} more needed!
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                width: `${percentComplete}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                borderRadius: '5px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div style={{
            background: 'var(--bg-subtle, #EEF2EB)',
            borderRadius: '12px',
            padding: '12px',
            marginTop: '14px',
            fontSize: '12px',
            color: 'var(--brand-primary, #1E3A2B)'
          }}>
            🎉 <strong>Reward Unlocked:</strong> Free ₹0 delivery + automatically applied 10% wholesale discount on all COD orders when target is reached!
          </div>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Share2 size={16} />
            {hasCopied ? 'WhatsApp Message Copied!' : 'Invite Neighbors on WhatsApp (+2 more to unlock)'}
          </button>
        </div>

        {/* Benefits Card */}
        <div style={{
          background: 'var(--bg-surface, #FFFFFF)',
          borderRadius: '20px',
          padding: '18px',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: '#1E293B' }}>
            Why Visakhapatnam Societies Choose Mandi Drops:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#475569' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Truck size={18} color="#047857" style={{ flexShrink: 0 }} />
              <div>
                <strong>Direct Farm-to-Gate:</strong> Produce harvested at 5:00 AM arrives directly at your apartment gate without warehouse delays.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <ShieldCheck size={18} color="#047857" style={{ flexShrink: 0 }} />
              <div>
                <strong>Single Gate Clearance:</strong> Your society security guard verifies one delivery partner instead of multiple couriers.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <ShoppingBag size={18} color="#047857" style={{ flexShrink: 0 }} />
              <div>
                <strong>Doorstep Inspection:</strong> Every resident inspects their own basket and pays via cash or UPI at their flat.
              </div>
            </div>
          </div>
        </div>

        {/* Start Shopping CTA */}
        <button
          type="button"
          onClick={() => navigate('/store/localfresh')}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--brand-primary, #1E3A2B)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <ShoppingBag size={18} />
          Shop Mandi Produce for Today's Drop
        </button>
      </div>
    </div>
  );
}
