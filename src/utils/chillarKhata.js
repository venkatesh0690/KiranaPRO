// "Chillar Khata" (Loose Change Wallet) & COD Trust Score
// Playbook Phase 29

export function getChillarBalance() {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem('kp_chillar_khata');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function addChillarBalance(amount) {
  if (typeof window === 'undefined' || amount <= 0) return 0;
  try {
    const current = getChillarBalance();
    const updated = current + amount;
    localStorage.setItem('kp_chillar_khata', String(updated));
    return updated;
  } catch {
    return 0;
  }
}

export function deductChillarBalance(amount) {
  if (typeof window === 'undefined' || amount <= 0) return 0;
  try {
    const current = getChillarBalance();
    const toDeduct = Math.min(current, amount);
    const updated = current - toDeduct;
    localStorage.setItem('kp_chillar_khata', String(updated));
    return toDeduct;
  } catch {
    return 0;
  }
}

// Prompt 29.3: Customer COD Trust Score
export function getCustomerTrustScore() {
  if (typeof window === 'undefined') return 60;
  try {
    const val = localStorage.getItem('kp_cod_trust_score');
    return val ? parseInt(val, 10) || 60 : 60;
  } catch {
    return 60;
  }
}

export function updateCustomerTrustScore(delta) {
  if (typeof window === 'undefined') return 60;
  try {
    const current = getCustomerTrustScore();
    const updated = Math.max(10, Math.min(100, current + delta));
    localStorage.setItem('kp_cod_trust_score', String(updated));
    return updated;
  } catch {
    return 60;
  }
}

export function isGoldNeighbor(score) {
  const current = score !== undefined ? score : getCustomerTrustScore();
  return current >= 80;
}

export function getCodOrderLimit(score) {
  return isGoldNeighbor(score) ? 5000 : 1500;
}

// Prompt 29.1: Dynamic Order-Locked UPI QR URL Generator
export function generateDoorstepUpiUri({ orderNumber, amount, merchantUpi = 'kiranapro.mandi@icici' }) {
  const formattedAmt = Number(amount).toFixed(2);
  const note = encodeURIComponent(`KP_${orderNumber}`);
  const pn = encodeURIComponent('KiranaPRO Hyperlocal');
  return `upi://pay?pa=${merchantUpi}&pn=${pn}&am=${formattedAmt}&cu=INR&tn=${note}`;
}
