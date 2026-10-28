import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';

export function SellerProtectedRoute({ children }) {
  const { authSession, logout } = useSecurity();
  const location = useLocation();

  if (!authSession.isAuthenticated || (authSession.role !== 'seller' && authSession.role !== 'admin')) {
    return (
      <div className="security-access-denied-page">
        <div className="security-denied-card">
          <div className="security-denied-icon">
            <Lock size={36} color="#DC2626" />
          </div>
          <h2>Authentication Required</h2>
          <p>
            You are attempting to access the protected <strong>KiranaPRO Seller Dashboard</strong>.
            Please authenticate using your registered mobile number and 4-digit security PIN.
          </p>
          <div className="security-badge-pill">
            <ShieldAlert size={14} color="#DC2626" />
            <span>RBAC Protected Route • Unauthorized Access Blocked</span>
          </div>
          <div className="security-actions">
            <a href="/seller/login" className="sec-login-link seller">
              Log In as Seller Partner
            </a>
            <a href="/" className="sec-back-link">
              <ArrowLeft size={14} /> Back to Customer App
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="protected-route-wrapper">
      {/* Top Security Session Bar */}
      <div className="sec-session-bar seller">
        <div className="sec-bar-left">
          <span className="sec-dot live" />
          <span>🔒 Authenticated Session: <strong>{authSession.userName}</strong></span>
          <span className="sec-token-badge">{authSession.token?.slice(0, 16)}...</span>
        </div>
        <div className="sec-bar-right">
          <span className="sec-expiry-hint">Session Active</span>
          <button type="button" className="sec-logout-btn" onClick={logout} title="Destroy Session">
            <LogOut size={13} />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function AdminProtectedRoute({ children }) {
  const { authSession, logout } = useSecurity();
  const location = useLocation();

  if (!authSession.isAuthenticated || authSession.role !== 'admin') {
    return (
      <div className="security-access-denied-page admin-theme">
        <div className="security-denied-card admin">
          <div className="security-denied-icon admin">
            <ShieldAlert size={38} color="#9333EA" />
          </div>
          <h2>Super Admin Authorization Required</h2>
          <p>
            The <strong>KiranaPRO Central Command Console</strong> is restricted to authorized
            platform administrators only. Your current role is <code>{authSession.role}</code>.
          </p>
          <div className="security-badge-pill admin">
            <Lock size={14} color="#9333EA" />
            <span>Level 3 Privileged Access Guard Active</span>
          </div>
          <div className="security-actions">
            <a href="/admin/login" className="sec-login-link admin">
              Authenticate via Admin Security Portal
            </a>
            <a href="/" className="sec-back-link">
              <ArrowLeft size={14} /> Return to Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="protected-route-wrapper admin">
      {/* Top Super Admin Session Bar */}
      <div className="sec-session-bar admin">
        <div className="sec-bar-left">
          <span className="sec-dot admin-live" />
          <span>🛡️ Super Admin Terminal: <strong>admin@kiranapro.com</strong></span>
          <span className="sec-token-badge admin">TOKEN: {authSession.token?.slice(0, 18)}...</span>
        </div>
        <div className="sec-bar-right">
          <span className="sec-mandi-gov">Platform Governance Active</span>
          <button type="button" className="sec-logout-btn admin" onClick={logout} title="Sign Out Admin">
            <LogOut size={13} />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
