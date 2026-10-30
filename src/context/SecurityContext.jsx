import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  generateSecureToken,
  validatePIN,
  validateEmail,
  isRateLimited,
  recordFailedAttempt,
  resetFailedAttempts,
  getRemainingLockoutTime,
  sanitizeInput
} from '../utils/security';

const SecurityContext = createContext(null);

const AUDIT_STORAGE_KEY = 'kp_sec_audit_trail';

export const SecurityProvider = ({ children }) => {
  // Session State
  const [authSession, setAuthSession] = useState({
    isAuthenticated:false,role:'guest',storeId:null,userName:null,
    userPhone:null,isTemporary:false,expiresAt:null
  });
  useEffect(()=>{
    let active=true;
    fetch('/api/auth?action=me',{credentials:'same-origin',cache:'no-store'})
      .then(response=>response.ok?response.json():null)
      .then(data=>{if(active && data?.user) setAuthSession(previous=>
        // A late session hydration must never replace a deliberate guest/login action.
        previous.isAuthenticated ? previous : data.user);})
      .catch(()=>{/* Fail closed; remain guest when session cannot be verified. */});
    return ()=>{active=false};
  },[]);

  // Keep address drafts ephemeral until a server-side owner-scoped address API is
  // implemented. Never expose one account's address via a shared browser key.
  const [savedAddresses,setSavedAddresses]=useState([]);
  useEffect(()=>{setSavedAddresses([]);},[authSession.userId,authSession.isTemporary]);

  // Security Audit Trail
  const [securityAuditLogs, setSecurityAuditLogs] = useState(() => {
    try {
      const saved = sessionStorage.getItem(AUDIT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'SEC-INIT-1',
        timestamp: new Date().toLocaleTimeString(),
        event: 'SECURITY_SHIELD_INITIALIZED',
        details: 'KiranaPRO Anti-Tamper, XSS Sanitizer & Free Delivery Rules active.',
        severity: 'info',
        ip: '127.0.0.1 (Local Verified)'
      }
    ];
  });

  // Save audit logs to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(securityAuditLogs.slice(0, 50)));
    } catch {
      // Ignore
    }
  }, [securityAuditLogs]);

  // Browser storage is not an authentication authority.\n\n  // Log a security event into audit trail
  const logSecurityEvent = useCallback((event, details, severity = 'info') => {
    const newLog = {
      id: `SEC-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleTimeString(),
      event,
      details,
      severity,
      ip: '127.0.0.1 (Local Verified)'
    };
    setSecurityAuditLogs(prev => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Auto-expire session check every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (authSession.isAuthenticated && authSession.expiresAt && Date.now() > authSession.expiresAt) {
        logSecurityEvent('SESSION_EXPIRED', `Session expired automatically for role: ${authSession.role}`, 'warning');
        logout();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [authSession, logSecurityEvent]);

  // Temporary preview: browsing only, no verified identity, order history,
  // seller/admin privileges or persistent customer account.
  const loginTemporaryCustomer = useCallback(() => {
    const session={
      isAuthenticated:true,
      isTemporary:true,
      role:'customer',
      storeId:null,
      userName:'Laxman',
      userPhone:null,
      token:generateSecureToken(),
      loginTime:new Date().toLocaleTimeString(),
      expiresAt:Date.now()+30*60*1000
    };
    setAuthSession(session);
    logSecurityEvent('TEMPORARY_PREVIEW_STARTED',
      'Temporary customer preview opened; no verified account or checkout permission','info');
    return {success:true,user:session};
  },[logSecurityEvent]);

  // All non-guest identities are issued and verified by the server.
  // Browser storage never grants customer, seller or administrator privileges.
  async function postAuth(action, payload) {
    try {
      const response=await fetch(`/api/auth?action=${action}`,{
        method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json','X-Kirana-Client':'web'},
        body:JSON.stringify(payload)
      });
      const result=await response.json();
      if (!response.ok) return {success:false,error:result.error||'Authentication failed'};
      return {success:true,...result};
    }catch{
      return {success:false,error:'Authentication service unavailable. Please try later.'};
    }
  }

  const loginCustomer=useCallback(async (phone,password)=>{
    const response=await postAuth('login',{role:'customer',phone,password});
    if(response.success && response.user) {
      setAuthSession(response.user);
      logSecurityEvent('CUSTOMER_LOGIN_SUCCESS','Customer session verified by server','info');
    }
    return response;
  },[logSecurityEvent]);

  const signupCustomer=useCallback(async (name,phone,password,address)=>{
    const response=await postAuth('signup',{role:'customer',name,phone,password,address});
    if(response.success && response.user){
      setAuthSession(response.user);
      logSecurityEvent('CUSTOMER_SIGNUP_SUCCESS','New server-backed customer registered','info');
    }
    return response;
  },[logSecurityEvent]);

  const loginSeller=useCallback(async (storeId,phone,password)=>{
    const response=await postAuth('login',{role:'seller',storeId:String(storeId),phone,password});
    if(response.success && response.user) {
      setAuthSession(response.user);
      logSecurityEvent('SELLER_LOGIN_SUCCESS','Seller and store assignment verified by server','info');
    }
    return response;
  },[logSecurityEvent]);

  const signupSeller=useCallback(async (storeName,ownerName,phone,password,address,category)=>{
    const response=await postAuth('signup',{
      role:'seller',storeName,name:ownerName,phone,password,address,category
    });
    if(response.success) {
      logSecurityEvent('SELLER_APPLICATION_RECEIVED',
        'Registration pending administrator verification; no seller role issued','info');
    }
    return response;
  },[logSecurityEvent]);

  const loginAdmin=useCallback(async (email,password)=>{
    const response=await postAuth('login',{role:'admin',email,password});
    if(response.success && response.user){
      setAuthSession(response.user);
      logSecurityEvent('ADMIN_LOGIN_SUCCESS','Administrator authenticated by server','info');
    }
    return response;
  },[logSecurityEvent]);

  // Modify User Name (Requirement: Add option to modify user name)
  const updateUserName = useCallback((newName) => {
    const sanitized = sanitizeInput(newName).trim();
    if (!sanitized || sanitized.length < 2) {
      return { success: false, error: 'Please enter a valid name (at least 2 letters).' };
    }
    setAuthSession(prev => ({
      ...prev,
      userName: sanitized,
      isAuthenticated: Boolean(prev.isAuthenticated) // Never elevate a guest
    }));
    logSecurityEvent('USER_PROFILE_UPDATED', `User changed name to: ${sanitized}`, 'info');
    return { success: true, name: sanitized };
  }, [logSecurityEvent]);

  // Add Different Shipping Address
  const addAddress = useCallback((newAddr) => {
    const id = `addr-${Date.now()}`;
    const cleanAddr = {
      id,
      type: newAddr.type || 'Home',
      title: sanitizeInput(newAddr.title || 'My Address'),
      street: sanitizeInput(newAddr.street || ''),
      landmark: sanitizeInput(newAddr.landmark || ''),
      city: sanitizeInput(newAddr.city || 'Visakhapatnam (Vizag)'),
      pincode: sanitizeInput(newAddr.pincode || '530013'),
      isDefault: Boolean(newAddr.isDefault)
    };

    setSavedAddresses(prev => {
      let updated = prev;
      if (cleanAddr.isDefault) {
        updated = updated.map(a => ({ ...a, isDefault: false }));
      }
      return [cleanAddr, ...updated];
    });

    logSecurityEvent('ADDRESS_ADDED', `New shipping address added: ${cleanAddr.title}`, 'info');
    return { success: true, address: cleanAddr };
  }, [logSecurityEvent]);

  const removeAddress = useCallback((id) => {
    setSavedAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    logSecurityEvent('ADDRESS_REMOVED', `Shipping address removed id: ${id}`, 'info');
  }, [logSecurityEvent]);

  const setDefaultAddress = useCallback((id) => {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    logSecurityEvent('ADDRESS_DEFAULT_SET', `Default shipping address set to id: ${id}`, 'info');
  }, [logSecurityEvent]);

  const logout=useCallback(async ()=>{
    // Clear UI immediately; revoke the httpOnly cookie on the server as well.
    setAuthSession({isAuthenticated:false,role:'guest',storeId:null,userName:null,
      userPhone:null,isTemporary:false,expiresAt:null});
    await postAuth('logout',{});
    logSecurityEvent('USER_LOGOUT','Session revocation requested','info');
  },[logSecurityEvent]);

  return (
    <SecurityContext.Provider
      value={{
        authSession,
        loginCustomer,
        loginTemporaryCustomer,
        signupCustomer,
        loginSeller,
        signupSeller,
        loginAdmin,
        logout,
        updateUserName,
        savedAddresses,
        addAddress,
        removeAddress,
        setDefaultAddress,
        securityAuditLogs,
        logSecurityEvent,
        // Demo credentials removed; server authentication is mandatory.
        isSessionValid: () => authSession.isAuthenticated && !authSession.isTemporary && authSession.expiresAt > Date.now()
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
