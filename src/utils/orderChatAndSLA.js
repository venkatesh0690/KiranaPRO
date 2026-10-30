// Bilingual Order Chat & SLA Watchdog
// Playbook Phase 31

export const QUICK_CHAT_PILLS = {
  customer: [
    { id: 'c1', en: 'Please bring change for ₹500', te: '₹500 చిల్లర తీసుకురండి' },
    { id: 'c2', en: 'Leave with security guard', te: 'సెక్యూరిటీ గార్డు వద్ద ఉంచండి' },
    { id: 'c3', en: 'Call me when you reach the street corner', te: 'గల్లీ చివరకి రాగానే కాల్ చేయండి' },
    { id: 'c4', en: 'Do not ring bell, baby is sleeping', te: 'డోర్‌బెల్ కొట్టకండి, పాప పడుకుంది' }
  ],
  rider: [
    { id: 'r1', en: 'Picking fresh items at Mandi now 🌾', te: 'మండీలో తాజా సరుకు తీసుకుంటున్నాను' },
    { id: 'r2', en: 'On the way, reaching in 10 mins 🛵', te: 'బయలుదేరాను, 10 నిమిషాల్లో వస్తున్నాను' },
    { id: 'r3', en: 'Reached your gate, please share 4-digit PIN 🚪', te: 'మీ గేట్ వద్దకు వచ్చాను, 4 అంకెల పిన్ చెప్పండి' },
    { id: 'r4', en: 'Have exact change ready 💵', te: 'చిల్లర సిద్ధంగా ఉంది' }
  ]
};

export function getOrderSlaStatus(order) {
  const createdAt = order?.createdAt || (order?.id ? parseInt(order.id.replace(/\D/g, '')) * 1000 : Date.now());
  const elapsedMinutes = Math.floor((Date.now() - createdAt) / 60000);

  if (elapsedMinutes > 90) {
    return {
      status: 'SLA_RISK',
      badge: '🔴 SLA Risk (>90m)',
      color: '#DC2626',
      bg: '#FEF2F2',
      elapsedMinutes,
      needsAction: true,
      actionPrompt: 'Pin to top & trigger courtesy credit'
    };
  }

  if (elapsedMinutes > 45 || (!order?.riderId && elapsedMinutes > 10)) {
    return {
      status: 'ACTION_NEEDED',
      badge: '🟡 Action Needed (>45m)',
      color: '#D97706',
      bg: '#FFFBEB',
      elapsedMinutes,
      needsAction: true,
      actionPrompt: 'Expedite pickup or reassign rider'
    };
  }

  return {
    status: 'ON_TRACK',
    badge: '🟢 On Track',
    color: '#16A34A',
    bg: '#F0FDF4',
    elapsedMinutes,
    needsAction: false,
    actionPrompt: null
  };
}
