import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, KeyRound, UserCheck, ChevronRight, Lock, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSecurity } from '../context/SecurityContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setActiveRole } = useStore();
  const { loginAdmin } = useSecurity();
  const [adminId, setAdminId] = useState('admin@kiranapro.com');
  const [adminPass, setAdminPass] = useState('admin123');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAdminLogin = (e) => {
    e?.preventDefault();
    setAuthError('');

    const res = loginAdmin(adminId, adminPass);
    if (!res.success) {
      setAuthError(res.error);
      return;
    }

    setActiveRole('admin');
    navigate('/admin/dashboard');
  };

  return (
    <div className="portal-auth-page admin-theme">
      {/* Top Navigation */}
      <div className="portal-auth-header">
        <button type="button" className="p-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back to Customer App</span>
        </button>
        <span className="p-role-badge admin">🛡️ Super Admin Portal</span>
      </div>

      <div className="portal-auth-card">
        {/* Banner */}
        <div className="portal-welcome-banner admin">
          <div className="pwb-icon">🛡️</div>
          <h2>KiranaPRO Admin Central</h2>
          <p>Platform monitoring, 2 km geo-fence radius governance, LocalFresh direct mandi catalog management & security audits.</p>
        </div>

        {/* Security Alert / Error Banner */}
        {authError && (
          <div className="auth-error-banner admin">
            <AlertTriangle size={18} color="#DC2626" />
            <span>{authError}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAdminLogin} className="auth-form-block">
          <div className="auth-input-group">
            <label className="auth-field-label">Administrator ID / Email:</label>
            <div className="auth-input-box">
              <UserCheck size={16} color="var(--n500)" />
              <input
                type="text"
                value={adminId}
                onChange={(e) => {
                  setAdminId(e.target.value);
                  setAuthError('');
                }}
                placeholder="admin@kiranapro.com"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-field-label">Admin Security Master Key:</label>
            <div className="auth-input-box">
              <KeyRound size={16} color="var(--n500)" />
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
          <span>Master Key: <strong>admin123</strong> • Privileged access protected with session audit logs</span>
        </div>
      </div>
    </div>
  );
}
