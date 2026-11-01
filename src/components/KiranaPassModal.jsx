import { X } from 'lucide-react';

export default function KiranaPassModal({ isOpen, onClose, passActive, onTogglePass }) {
  if (!isOpen) return null;

  const handleStartTrial = () => {
    if (!passActive) {
      onTogglePass();
    }
    onClose();
  };

  const handleCancelMembership = () => {
    if (passActive) {
      onTogglePass();
    }
    onClose();
  };

  return (
    <div className="kpm-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="kpm-title">
      <div className="kpm-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top-left close button */}
        <button
          type="button"
          className="kpm-close-btn"
          onClick={onClose}
          aria-label="Close KiranaPass modal"
        >
          <X size={20} strokeWidth={2.2} />
        </button>

        {/* Brand Logo matching DashPass aesthetic */}
        <div className="kpm-brand-header">
          <svg width="26" height="22" viewBox="0 0 28 24" fill="none" className="kpm-logo-mark" aria-hidden="true">
            <path d="M3 18L11 4h6l-8 14H3z" fill="#4F46E5" />
            <path d="M11 18l8-14h6l-8 14h-6z" fill="#6366F1" />
          </svg>
          <span className="kpm-brand-name">
            Kirana<span>Pass</span>
          </span>
        </div>

        {/* Main Headline */}
        <h2 id="kpm-title" className="kpm-headline">
          Get ₹0 delivery fees and exclusive benefits
        </h2>

        {/* Benefits List matching DoorDash layout */}
        <div className="kpm-benefits-list">
          {/* 1. ₹0 Delivery Fees */}
          <div className="kpm-benefit-item">
            <div className="kpm-icon-wrap" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="7" width="16" height="14" rx="3" fill="#FF3008" />
                <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="#FF3008" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M9 11h6M9 13.5h4.5M11.5 11v6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="kpm-benefit-text">
              <h3 className="kpm-benefit-title">₹0 delivery fees</h3>
              <p className="kpm-benefit-sub">And lower service fees. On eligible orders.</p>
            </div>
          </div>

          {/* 2. Member-exclusive deals */}
          <div className="kpm-benefit-item">
            <div className="kpm-icon-wrap" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l2.6 3.8 4.6-.3.9 4.5 4.1 2.2-2.1 4.1 2.3 4-4.2 1.8-.7 4.6-4.6-.5L12 22l-2.9-3.5-4.6.5-.7-4.6-4.2-1.8 2.3-4-2.1-4.1 4.1-2.2.9-4.5 4.6.3L12 2z"
                  fill="#FF3008"
                />
                <circle cx="9" cy="9.5" r="1.5" fill="#FFFFFF" />
                <circle cx="15" cy="14.5" r="1.5" fill="#FFFFFF" />
                <path d="M15 9l-6 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="kpm-benefit-text">
              <h3 className="kpm-benefit-title">Member-exclusive deals</h3>
              <p className="kpm-benefit-sub">Save on restaurants, groceries, and more</p>
            </div>
          </div>

          {/* 3. Share your benefits */}
          <div className="kpm-benefit-item">
            <div className="kpm-icon-wrap" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10.5z" fill="#EA580C" />
                <path d="M9 22V13h6v9" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="kpm-benefit-text">
              <h3 className="kpm-benefit-title">Share your benefits with family sharing</h3>
              <p className="kpm-benefit-sub">Add a loved one for free</p>
            </div>
          </div>

          {/* 4. 5% back on eligible orders */}
          <div className="kpm-benefit-item">
            <div className="kpm-icon-wrap" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="7" width="13" height="14" rx="2" fill="#F97316" />
                <path d="M6 7V4.5a3.5 3.5 0 0 1 7 0V7" stroke="#F97316" strokeWidth="2" />
                <circle cx="17" cy="15" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M15.5 13h3m-3 1.8h2m-0.5-1.8v4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="kpm-benefit-text">
              <h3 className="kpm-benefit-title">5% back on eligible pickup orders</h3>
              <p className="kpm-benefit-sub">Earn 5% KiranaCoins credits on eligible orders</p>
            </div>
          </div>

          {/* 5. Cancel anytime */}
          <div className="kpm-benefit-item">
            <div className="kpm-icon-wrap" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2.5" fill="#16A34A" />
                <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
                <circle cx="5.5" cy="9" r="1" fill="#FFFFFF" />
                <circle cx="18.5" cy="15" r="1" fill="#FFFFFF" />
              </svg>
            </div>
            <div className="kpm-benefit-text">
              <h3 className="kpm-benefit-title">Cancel anytime</h3>
              <p className="kpm-benefit-sub">No hidden fees or lock-ins</p>
            </div>
          </div>
        </div>

        {/* Disclaimer Note */}
        <p className="kpm-disclaimer">
          By tapping the button below, you agree to the{' '}
          <a href="#terms" onClick={(e) => e.preventDefault()}>
            Terms and Conditions
          </a>
          . You also agree to a recurring monthly charge (currently ₹99) until you cancel. Cancel
          in app or online prior to renewal date to avoid future charges. See{' '}
          <a href="#cancellation" onClick={(e) => e.preventDefault()}>
            Cancellation Policy
          </a>
          .
        </p>

        {/* Action Button */}
        <div className="kpm-actions">
          {passActive ? (
            <div className="kpm-active-actions">
              <button
                type="button"
                className="kpm-cta-btn is-active-badge"
                onClick={onClose}
              >
                ✓ KiranaPass Active · VIP Benefits Unlocked
              </button>
              <button
                type="button"
                className="kpm-cancel-membership-link"
                onClick={handleCancelMembership}
              >
                Cancel Membership
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="kpm-cta-btn"
              onClick={handleStartTrial}
            >
              Start 30-day free trial
            </button>
          )}

          {/* Skip link */}
          <button type="button" className="kpm-skip-btn" onClick={onClose}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
