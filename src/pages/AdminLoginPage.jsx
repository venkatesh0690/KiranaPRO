import { useEffect, useState } from 'react';
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
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');
  const [setupAvailable,setSetupAvailable]=useState(false);
  const [setupMode,setSetupMode]=useState(false);
  const [setupToken,setSetupToken]=useState('');
  const [adminName,setAdminName]=useState('KiranaPRO Administrator');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [setupBusy,setSetupBusy]=useState(false);
  const [setupDone,setSetupDone]=useState('');
  useEffect(()=>{
    let active=true;
    fetch('/api/admin-setup',{credentials:'same-origin',cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(data=>{if(active)setSetupAvailable(Boolean(data?.setupAvailable));})
      .catch(()=>{});
    return ()=>{active=false};
  },[]);
  const handleAdminSetup=async event=>{
    event.preventDefault();
    setAuthError('');
    if(adminPass!==confirmPassword){setAuthError('Passwords do not match.');return;}
    setSetupBusy(true);
    try{
      const response=await fetch('/api/admin-setup',{
        method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json','X-Kirana-Client':'web'},
        body:JSON.stringify({email,name:adminName,password:adminPass,setupToken})
      });
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Setup failed');
      setSetupAvailable(false);
      setSetupMode(false);
      setSetupToken('');
      setConfirmPassword('');
      setSetupDone('Your administrator password was saved securely. Sign in below.');
    }catch(error){setAuthError(error.message||'Could not activate administrator account.');}
    finally{setSetupBusy(false);}
  };


  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const res = await loginAdmin(email, adminPass);

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
        {setupAvailable && (
          <div style={{margin:'0 0 18px'}}>
            <button type="button" className="auth-primary-btn admin"
              onClick={()=>{setSetupMode(v=>!v);setAuthError('');}}
              style={{background:'#495453'}}>
              {setupMode?'Back to administrator login':'Set up administrator account'}
            </button>
          </div>
        )}
        {setupDone && <p role="status">{setupDone}</p>}
        {setupMode && setupAvailable ? (
          <form onSubmit={handleAdminSetup} className="auth-form-block">
            <p>Use your one-time setup code to choose an administrator email and a strong password.
              The code expires and can be used only once.</p>
            <label className="auth-field-label" htmlFor="kp-admin-setup-email">Admin email</label>
            <input id="kp-admin-setup-email" type="email" value={email}
              onChange={e=>setEmail(e.target.value)} required autoComplete="email"
              style={{width:'100%',padding:12,marginBottom:12}}/>
            <label className="auth-field-label" htmlFor="kp-admin-setup-name">Display name</label>
            <input id="kp-admin-setup-name" value={adminName}
              onChange={e=>setAdminName(e.target.value)} required minLength={2}
              style={{width:'100%',padding:12,marginBottom:12}}/>
            <label className="auth-field-label" htmlFor="kp-admin-setup-code">Single-use setup code</label>
            <input id="kp-admin-setup-code" type="password" value={setupToken}
              onChange={e=>setSetupToken(e.target.value.trim().toLowerCase())}
              autoComplete="off" required minLength={48} maxLength={48}
              style={{width:'100%',padding:12,marginBottom:12}}/>
            <label className="auth-field-label" htmlFor="kp-admin-setup-pass">New password (16+ characters)</label>
            <input id="kp-admin-setup-pass" type="password" value={adminPass}
              onChange={e=>setAdminPass(e.target.value)} autoComplete="new-password"
              minLength={16} required style={{width:'100%',padding:12,marginBottom:12}}/>
            <label className="auth-field-label" htmlFor="kp-admin-setup-confirm">Confirm password</label>
            <input id="kp-admin-setup-confirm" type="password" value={confirmPassword}
              onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password"
              minLength={16} required style={{width:'100%',padding:12,marginBottom:12}}/>
            <button type="submit" className="auth-primary-btn admin" disabled={setupBusy}>
              {setupBusy?'Securing account…':'Create administrator account'}
            </button>
          </form>
        ) : <form onSubmit={handleAdminLogin} className="auth-form-block">
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
        </form>}

        <div className="quick-access-test-note">
          <ShieldCheck size={14} color="#9333EA" />
          <span>Admin authentication is verified by the server. No demo master password is accepted.</span>
        </div>
      </div>
    </div>
  );
}
