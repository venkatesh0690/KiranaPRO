import { useState, useEffect } from 'react';
import { Home, Building2, MapPin, Shield, Check, Info } from 'lucide-react';
import { GATE_INSTRUCTION_OPTIONS } from '../utils/addressAndGate';

export default function StructuredAddressForm({
  initialAddress,
  currentArea,
  onAddressChange,
  showTitle = true
}) {
  const [address, setAddress] = useState(() => {
    if (typeof initialAddress === 'object' && initialAddress !== null) {
      return {
        flat_or_house_no: initialAddress.flat_or_house_no || '',
        building_or_society_name: initialAddress.building_or_society_name || '',
        street_and_landmark: initialAddress.street_and_landmark || '',
        floor_number: initialAddress.floor_number || '',
        has_lift: initialAddress.has_lift !== false,
        area_id: initialAddress.area_id || currentArea || 'Siripuram',
        gate_instruction: initialAddress.gate_instruction || 'HAND_TO_ME'
      };
    }
    return {
      flat_or_house_no: '',
      building_or_society_name: '',
      street_and_landmark: typeof initialAddress === 'string' ? initialAddress : '',
      floor_number: '',
      has_lift: true,
      area_id: currentArea || 'Siripuram',
      gate_instruction: 'HAND_TO_ME'
    };
  });

  const handleChange = (field, val) => {
    const updated = { ...address, [field]: val };
    setAddress(updated);
    if (onAddressChange) onAddressChange(updated);
  };

  useEffect(() => {
    if (currentArea && address.area_id !== currentArea) {
      handleChange('area_id', currentArea);
    }
  }, [currentArea]);

  return (
    <div className="kp-structured-address-form" style={{
      background: 'var(--bg-surface, #FFFFFF)',
      borderRadius: '16px',
      border: '1px solid rgba(0,0,0,0.08)',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}>
      {showTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <MapPin size={18} color="var(--brand-primary, #1E3A2B)" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
            Visakhapatnam Doorstep Address & Gate Instructions
          </h4>
        </div>
      )}

      {/* Row 1: Flat/House No & Building/Society */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
            Flat / Door / House No. *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 402, Block B"
            value={address.flat_or_house_no}
            onChange={(e) => handleChange('flat_or_house_no', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              background: '#F8FAFC'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
            Apartment / Society Name
          </label>
          <input
            type="text"
            placeholder="e.g. Siripuram Heights"
            value={address.building_or_society_name}
            onChange={(e) => handleChange('building_or_society_name', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              background: '#F8FAFC'
            }}
          />
        </div>
      </div>

      {/* Row 2: Street & Landmark (Required) */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
          Street & Landmark (Required) *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Near Sampath Vinayaka Temple, 3rd Lane"
          value={address.street_and_landmark}
          onChange={(e) => handleChange('street_and_landmark', e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            background: '#F8FAFC'
          }}
        />
      </div>

      {/* Row 3: Floor & Lift Option */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
        <div style={{ flex: '1' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
            Floor No. (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 4th Floor"
            value={address.floor_number}
            onChange={(e) => handleChange('floor_number', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid #CBD5E1',
              borderRadius: '8px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
          <input
            type="checkbox"
            id="kp-has-lift"
            checked={address.has_lift}
            onChange={(e) => handleChange('has_lift', e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary, #1E3A2B)', cursor: 'pointer' }}
          />
          <label htmlFor="kp-has-lift" style={{ fontSize: '13px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
            Building has working lift
          </label>
        </div>
      </div>

      {/* Row 4: DoorDash-Style Gate & Delivery Instructions (Prompt 19.1) */}
      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
            ⚡ Gate & Drop-Off Instructions for Rider:
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Tap to select</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {GATE_INSTRUCTION_OPTIONS.map((opt) => {
            const isSelected = address.gate_instruction === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleChange('gate_instruction', opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--brand-primary, #1E3A2B)' : '1px solid #E2E8F0',
                  background: isSelected ? 'var(--bg-subtle, #EEF2EB)' : '#FFFFFF',
                  color: isSelected ? 'var(--brand-primary, #1E3A2B)' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '16px' }}>{opt.icon}</span>
                <div style={{ flex: '1' }}>
                  <div style={{ fontSize: '12px', fontWeight: isSelected ? '700' : '600' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px' }}>
                    {opt.riderNote}
                  </div>
                </div>
                {isSelected && (
                  <Check size={16} color="var(--brand-primary, #1E3A2B)" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
