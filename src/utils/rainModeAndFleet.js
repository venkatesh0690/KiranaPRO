// Visakhapatnam Coastal Rain Mode & Fleet Scorecard
// Playbook Phase 27

export function isRainModeActive(areaId) {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('kp_rain_mode_zones');
    if (!raw) return false;
    const zones = JSON.parse(raw);
    return Boolean(zones[areaId] || zones['ALL']);
  } catch {
    return false;
  }
}

export function setRainModeActive(areaId, isActive) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('kp_rain_mode_zones');
    const zones = raw ? JSON.parse(raw) : {};
    zones[areaId] = isActive;
    localStorage.setItem('kp_rain_mode_zones', JSON.stringify(zones));
  } catch {}
}

export function getRiderEarningsScorecard(riderId) {
  return {
    riderId: riderId || 'RIDER-VIZAG-04',
    name: 'K. Shiva Kumar',
    hub: 'Siripuram Mandi Hub',
    ordersDeliveredToday: 14,
    onTimePercentage: 98,
    customerRating: 4.9,
    mandiChecksApproved: 3,
    zeroDamagedStreakDays: 18,
    earnings: {
      basePayout: 560, // ₹40 per delivery
      rainBonus: 140,  // ₹10 per delivery under rain
      tips: 70,
      totalEarnedToday: 770
    },
    codCashHeld: 2420, // To hand over to admin
    handoverThreshold: 5000
  };
}
