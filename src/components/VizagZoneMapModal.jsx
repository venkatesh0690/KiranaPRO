import { useState } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, X } from 'lucide-react';
import { DELIVERY_AREAS } from '../data/deliveryAreas';

// Coordinates for the 5 Visakhapatnam Delivery Hubs
const VIZAG_HUBS = {
  Siripuram: { lat: 17.7214, lng: 83.3155, eta: '25-35 min', distance: '0.4 km', hub: 'Siripuram Central Mandi Hub' },
  'MVP Colony': { lat: 17.7412, lng: 83.3364, eta: '30-40 min', distance: '1.2 km', hub: 'MVP Sector 3 Hub' },
  Dabagardens: { lat: 17.7128, lng: 83.2986, eta: '20-30 min', distance: '0.8 km', hub: 'Dabagardens Rythu Hub' },
  'NAD Kotha Road': { lat: 17.7483, lng: 83.2452, eta: '35-45 min', distance: '1.8 km', hub: 'NAD Junction Express Hub' },
  Gajuwaka: { lat: 17.6908, lng: 83.2091, eta: '30-45 min', distance: '2.1 km', hub: 'Gajuwaka Industrial Hub' }
};

export default function VizagZoneMapModal({ currentArea, onSelectArea, onClose }) {
  const [locating, setLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('GPS not supported in this browser; please select your area below.');
      return;
    }
    setLocating(true);
    setGeoMessage('Detecting nearest Visakhapatnam neighborhood…');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;

        // Find closest hub using Euclidean distance
        let closest = 'Siripuram';
        let minDistance = Infinity;

        Object.entries(VIZAG_HUBS).forEach(([area, coords]) => {
          const d = Math.hypot(coords.lat - latitude, coords.lng - longitude);
          if (d < minDistance) {
            minDistance = d;
            closest = area;
          }
        });

        setGeoMessage(`📍 Nearest hub detected: ${closest}!`);
        setTimeout(() => {
          onSelectArea(closest);
          onClose();
        }, 800);
      },
      () => {
        setLocating(false);
        setGeoMessage('GPS permission denied. Please tap your neighborhood below.');
      },
      { timeout: 7000 }
    );
  };

  return (
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
        background: 'var(--bg-surface, #FFFFFF)',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--brand-primary, #1E3A2B)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
              Visakhapatnam Delivery Hubs & ETA Map
            </h3>
            <span style={{ fontSize: '11px', color: '#A7F3D0' }}>
              Select your neighborhood for live Mandi inventory
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Interactive Stylized SVG Map of Visakhapatnam Coast & 5 Hubs */}
        <div style={{
          position: 'relative',
          height: '180px',
          background: 'linear-gradient(135deg, #E6F4EA 0%, #D1E7DD 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Bay of Bengal Stylized Wave */}
          <svg style={{ position: 'absolute', right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 400 200">
            <path d="M0,150 C150,120 250,180 400,140 L400,200 L0,200 Z" fill="#0D9488" />
            <path d="M0,170 C120,150 280,190 400,160 L400,200 L0,200 Z" fill="#0284C7" />
          </svg>

          {/* 5 Hub Pin Drops */}
          <div style={{ position: 'relative', width: '340px', height: '150px' }}>
            {/* NAD Kotha Road */}
            <div style={{ position: 'absolute', left: '20px', top: '25px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { onSelectArea('NAD Kotha Road'); onClose(); }}
                style={{
                  background: currentArea === 'NAD Kotha Road' ? '#1E3A2B' : '#FFFFFF',
                  color: currentArea === 'NAD Kotha Road' ? '#FFF' : '#1E3A2B',
                  border: '2px solid #1E3A2B',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                📍 NAD Kotha Rd
              </button>
            </div>

            {/* Gajuwaka */}
            <div style={{ position: 'absolute', left: '10px', bottom: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { onSelectArea('Gajuwaka'); onClose(); }}
                style={{
                  background: currentArea === 'Gajuwaka' ? '#1E3A2B' : '#FFFFFF',
                  color: currentArea === 'Gajuwaka' ? '#FFF' : '#1E3A2B',
                  border: '2px solid #1E3A2B',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                📍 Gajuwaka
              </button>
            </div>

            {/* Dabagardens */}
            <div style={{ position: 'absolute', left: '130px', top: '75px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { onSelectArea('Dabagardens'); onClose(); }}
                style={{
                  background: currentArea === 'Dabagardens' ? '#1E3A2B' : '#FFFFFF',
                  color: currentArea === 'Dabagardens' ? '#FFF' : '#1E3A2B',
                  border: '2px solid #1E3A2B',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                📍 Dabagardens
              </button>
            </div>

            {/* Siripuram (Central) */}
            <div style={{ position: 'absolute', left: '160px', top: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { onSelectArea('Siripuram'); onClose(); }}
                style={{
                  background: currentArea === 'Siripuram' ? '#1E3A2B' : '#FFFFFF',
                  color: currentArea === 'Siripuram' ? '#FFF' : '#1E3A2B',
                  border: '2px solid #1E3A2B',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                }}
              >
                ⭐ Siripuram
              </button>
            </div>

            {/* MVP Colony */}
            <div style={{ position: 'absolute', right: '15px', top: '40px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => { onSelectArea('MVP Colony'); onClose(); }}
                style={{
                  background: currentArea === 'MVP Colony' ? '#1E3A2B' : '#FFFFFF',
                  color: currentArea === 'MVP Colony' ? '#FFF' : '#1E3A2B',
                  border: '2px solid #1E3A2B',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                📍 MVP Colony
              </button>
            </div>
          </div>
        </div>

        {/* GPS Location Finder Button */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#EEF2EB',
              color: 'var(--brand-primary, #1E3A2B)',
              border: '1.5px solid var(--brand-primary, #1E3A2B)',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: locating ? 'wait' : 'pointer'
            }}
          >
            <Navigation size={16} />
            {locating ? 'Snapping to Nearest Visakhapatnam Zone…' : 'Detect My Visakhapatnam Neighborhood (GPS)'}
          </button>
          {geoMessage && (
            <div style={{ marginTop: '8px', fontSize: '11px', textAlign: 'center', color: '#047857', fontWeight: '600' }}>
              {geoMessage}
            </div>
          )}
        </div>

        {/* List of 5 Delivery Hubs with Live ETAs */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
          {DELIVERY_AREAS.map((area) => {
            const isSelected = currentArea === area;
            const hubInfo = VIZAG_HUBS[area] || { eta: '25-35 min', distance: '1.0 km', hub: `${area} Hub` };
            return (
              <button
                key={area}
                type="button"
                onClick={() => { onSelectArea(area); onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--brand-primary, #1E3A2B)' : '1px solid #E2E8F0',
                  background: isSelected ? 'var(--bg-subtle, #EEF2EB)' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? 'var(--brand-primary, #1E3A2B)' : '#1E293B' }}>
                    {area}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {hubInfo.hub} • {hubInfo.distance} away
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#047857',
                    background: '#ECFDF5',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    <Clock size={12} />
                    {hubInfo.eta}
                  </span>
                  {isSelected && <CheckCircle2 size={16} color="var(--brand-primary, #1E3A2B)" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
