import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Clock, Check, Plus, ShoppingBag, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { B2B_BULK_ITEMS, B2B_SLOTS } from '../utils/b2bWholesale';
import { useCart } from '../context/CartContext';

export default function B2BWholesalePage({ userLocation = 'Siripuram' }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSlot, setSelectedSlot] = useState('b2b-dawn');
  const [addedItems, setAddedItems] = useState({});

  const handleAddBulk = (item) => {
    // Add bulk item to cart as custom product
    addToCart({
      id: item.id,
      name: item.name,
      price: item.b2bPrice,
      mrp: item.mrp,
      unit: item.unit,
      category: item.category,
      isB2B: true
    }, 'localfresh');

    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

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
            <Building2 size={18} color="#A7F3D0" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
              KiranaPRO B2B Wholesale
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: '#A7F3D0' }}>
            Tiffin Centers, Curry Points, Hostels & Catering • {userLocation}
          </span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Slot selector */}
        <div style={{
          background: 'var(--bg-surface, #FFFFFF)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(0,0,0,0.08)',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)', marginBottom: '8px' }}>
            Select Commercial Dawn Drop Slot:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {B2B_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid var(--brand-primary, #1E3A2B)' : '1px solid #E2E8F0',
                    background: isSelected ? 'var(--bg-subtle, #EEF2EB)' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{slot.label}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{slot.desc}</div>
                  </div>
                  {isSelected && <Check size={18} color="var(--brand-primary, #1E3A2B)" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wholesale Sack & Crate Catalog */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
            Daily Commercial Sacks & Crates:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {B2B_BULK_ITEMS.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-surface, #FFFFFF)',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '2px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
                    Bulk Packing: <strong>{item.unit}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--brand-primary, #1E3A2B)' }}>
                      ₹{item.b2bPrice}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                      ₹{item.mrp}
                    </span>
                    <span style={{ fontSize: '10px', background: '#ECFDF5', color: '#047857', fontWeight: '800', padding: '2px 6px', borderRadius: '6px' }}>
                      SAVE ₹{item.savings}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddBulk(item)}
                  style={{
                    padding: '8px 14px',
                    background: addedItems[item.id] ? '#10B981' : 'var(--brand-primary, #1E3A2B)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {addedItems[item.id] ? <Check size={14} /> : <Plus size={14} />}
                  {addedItems[item.id] ? 'Added' : 'Add Sack'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GST & B2B Invoicing Transparency Card */}
        <div style={{
          background: 'var(--bg-subtle, #EEF2EB)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <FileSpreadsheet size={24} color="var(--brand-primary, #1E3A2B)" />
          <div style={{ fontSize: '12px', color: 'var(--brand-primary, #1E3A2B)', lineHeight: '1.45' }}>
            <strong>GST Commercial Invoicing:</strong> Get monthly GST input credit invoices with your business name and GSTIN generated automatically on every order!
          </div>
        </div>

        {/* View Cart Button */}
        <button
          type="button"
          onClick={() => navigate('/cart')}
          style={{
            marginTop: '20px',
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
          Go to Cart & Choose COD
        </button>
      </div>
    </div>
  );
}
