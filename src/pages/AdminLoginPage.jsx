import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { useStore } from '../context/StoreContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useSecurity();
  const { setActiveRole } = useStore();

  const [email, setEmail] = useState('admin@kiranapro.com');
  const [adminPass, setAdminPass] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const res = loginAdmin(email, adminPass);

    if (res.success) {
      setActiveRole('admin');
      navigate('/admin/dashboard');
    } else {
      setAuthError(res.error || 'Access Denied: Invalid administrator credentials.');
    }
  };

  return (
    <div className="portal-login-screen admin-theme">
      {/* Top Navbar */}
      <div className="portal-top-bar">
        <button
          type="button"
          className="portal-back-btn"
          onClick={() => {
            setActiveRole('user');
            navigate('/home');
          }}
        >
          <ArrowLeft size={16} />
          <span>Storefront</span>
        </button>
        <span className="portal-tag admin">Platform Super-Admin</span>
      </div>

      <div className="portal-card">
        {/* Portal Header */}
        <div className="portal-hd-icon admin">
          <ShieldAlert size={34} color="#FFFFFF" />
        </div>
        <div className="portal-hd-titles">
          <h2>KiranaPRO Admin Command</h2>
          <p>
            Central control for LocalFresh Direct Mandi, real-time stock pricing, seller oversight & platform security monitoring.
          </p>
        </div>

        {/* Security Alert / Error Banner */}
        {authError && (
          <div className="auth-error-banner">
            <AlertTriangle size={18} color="#DC2626" />
            <span>{authError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="auth-form-block">
          <div className="auth-input-group">
            <label className="auth-field-label">Administrator Email / ID:</label>
            <div className="auth-input-box">
              <Mail size={16} color="var(--n500)" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError('');
                }}
                placeholder="admin@kiranapro.com"
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-field-label">Administrator Master Password:</label>
            <div className="auth-input-box">
              <Lock size={16} color="var(--n500)" />
              <input
                type={showPass ? 'text' : 'password'}
                value={adminPass}
                onChange={(e) => {
                  setAdminPass(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter master key"
              />
              <button
                type="button"
                className="pin-toggle-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-primary-btn admin">
            <span>Authenticate Platform Command Center</span>
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="quick-access-test-note">
          <ShieldCheck size={14} color="#9333EA" />
          <span>Privileged access protected with end-to-end cryptographic session audit logs.</span>
        </div>
      </div>
    </div>
  );
}
