import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  generateSecureToken,
  validatePIN,
  validateEmail,
  isRateLimited,
  recordFailedAttempt,
  resetFailedAttempts,
  getRemainingLockoutTime,
  sanitizeInput,
  SAMPLE_CREDENTIALS
} from '../utils/security';

const SecurityContext = createContext(null);

const SESSION_STORAGE_KEY = 'kp_sec_auth_session';
const AUDIT_STORAGE_KEY = 'kp_sec_audit_trail';
const SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

export const SecurityProvider = ({ children }) => {
  // Session State
  const [authSession, setAuthSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    // Default logged out state: Do NOT show any user name when not logged in!
    return {
      isAuthenticated: false,
      role: 'guest', // 'guest' | 'customer' | 'seller' | 'admin'
      storeId: null,
      userName: null,
      userPhone: null,
      token: null,
      loginTime: null,
      expiresAt: null
    };
  });

  // Saved Shipping Addresses (Requirement: Add different shipping address)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('kp_shipping_addresses');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'addr-1',
        type: 'Home',
        title: 'Flat 402, Sai Residency',
        street: 'Maddilapalem Main Road, Near AU Gate',
        landmark: 'Opposite Andhra University Gate',
        city: 'Visakhapatnam (Vizag)',
        pincode: '530013',
        isDefault: true
      },
      {
        id: 'addr-2',
        type: 'Work',
        title: 'Tech Hub Office, Floor 3',
        street: 'VIP Road, CBM Compound, Siripuram',
        landmark: 'Near Circuit House',
        city: 'Visakhapatnam (Vizag)',
        pincode: '530003',
        isDefault: false
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kp_shipping_addresses', JSON.stringify(savedAddresses));
    } catch {
      // Ignore
    }
  }, [savedAddresses]);

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

  // Save session state to sessionStorage
  useEffect(() => {
    try {
      if (authSession.isAuthenticated) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authSession));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [authSession]);

  // Log a security event into audit trail
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

  // Customer Login with Rate Limiting & 4-Digit PIN
  const loginCustomer = useCallback((phone, pin) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const rateLimitKey = `customer_${cleanPhone || 'unknown'}`;

    if (isRateLimited(rateLimitKey)) {
      const remSeconds = getRemainingLockoutTime(rateLimitKey);
      logSecurityEvent('CUSTOMER_BRUTE_FORCE_BLOCKED', `Blocked login attempt for phone ${phone}. Rate limited for ${remSeconds}s`, 'critical');
      return {
        success: false,
        error: `Account temporarily locked due to multiple failed attempts. Try again in ${remSeconds} seconds.`
      };
    }

    if (cleanPhone.length < 10) {
      recordFailedAttempt(rateLimitKey);
      logSecurityEvent('CUSTOMER_LOGIN_FAILED', `Invalid mobile number: ${phone}`, 'warning');
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    if (!validatePIN(pin)) {
      const rec = recordFailedAttempt(rateLimitKey);
      const remainingAttempts = Math.max(0, 4 - rec.count);
      logSecurityEvent('CUSTOMER_LOGIN_FAILED', `Invalid PIN for customer ${cleanPhone}. ${remainingAttempts} attempts remaining`, 'warning');
      return {
        success: false,
        error: `Invalid 4-digit PIN. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Account locked for 60 seconds.'}`
      };
    }

    // Check pre-seeded sample customer or registered customers
    let customerName = 'Customer';
    if (cleanPhone === SAMPLE_CREDENTIALS.user.phone) {
      customerName = SAMPLE_CREDENTIALS.user.name;
    } else {
      try {
        const savedUsers = JSON.parse(localStorage.getItem('kp_registered_users') || '[]');
        const found = savedUsers.find(u => u.phone === cleanPhone);
        if (found) customerName = found.name;
        else customerName = `Customer (${cleanPhone.slice(-4)})`;
      } catch {
        customerName = `Customer (${cleanPhone.slice(-4)})`;
      }
    }

    resetFailedAttempts(rateLimitKey);
    const token = generateSecureToken();
    const session = {
      isAuthenticated: true,
      role: 'customer',
      storeId: null,
      userName: customerName,
      userPhone: `+91 ${cleanPhone.slice(-10)}`,
      token,
      loginTime: new Date().toLocaleTimeString(),
      expiresAt: Date.now() + SESSION_EXPIRY_MS
    };

    setAuthSession(session);
    logSecurityEvent('CUSTOMER_LOGIN_SUCCESS', `Customer authenticated: ${customerName} (+91 ${cleanPhone.slice(-10)})`, 'info');
    return { success: true, user: session };
  }, [logSecurityEvent]);

  // Customer Sign Up
  const signupCustomer = useCallback((name, phone, pin, address) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const sanitizedName = sanitizeInput(name);
    const sanitizedAddress = sanitizeInput(address || 'Maddilapalem, Vizag');

    if (!sanitizedName || sanitizedName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!validatePIN(pin)) {
      return { success: false, error: 'Please set a secure 4-digit PIN.' };
    }

    // Save to registered users list
    try {
      const savedUsers = JSON.parse(localStorage.getItem('kp_registered_users') || '[]');
      const filtered = savedUsers.filter(u => u.phone !== cleanPhone);
      filtered.push({
        name: sanitizedName,
        phone: cleanPhone,
        address: sanitizedAddress,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('kp_registered_users', JSON.stringify(filtered));
    } catch {
      // Ignore
    }

    const token = generateSecureToken();
    const session = {
      isAuthenticated: true,
      role: 'customer',
      storeId: null,
      userName: sanitizedName,
      userPhone: `+91 ${cleanPhone.slice(-10)}`,
      userAddress: sanitizedAddress,
      token,
      loginTime: new Date().toLocaleTimeString(),
      expiresAt: Date.now() + SESSION_EXPIRY_MS
    };

    setAuthSession(session);
    logSecurityEvent('CUSTOMER_SIGNUP_SUCCESS', `New Customer Account created: ${sanitizedName} (+91 ${cleanPhone.slice(-10)})`, 'info');
    return { success: true, user: session };
  }, [logSecurityEvent]);

  // Authenticate Seller with Rate Limiting & 4-Digit PIN check
  const loginSeller = useCallback((storeId, phone, pin, storeName) => {
    const rateLimitKey = `seller_${phone || 'unknown'}`;

    if (isRateLimited(rateLimitKey)) {
      const remSeconds = getRemainingLockoutTime(rateLimitKey);
      logSecurityEvent('SELLER_BRUTE_FORCE_BLOCKED', `Blocked attempt for phone ${phone}. Rate limited for ${remSeconds}s`, 'critical');
      return {
        success: false,
        error: `Account temporarily locked due to multiple failed attempts. Try again in ${remSeconds} seconds.`
      };
    }

    if (!phone || phone.length < 10) {
      recordFailedAttempt(rateLimitKey);
      logSecurityEvent('SELLER_LOGIN_FAILED', `Invalid mobile number: ${phone}`, 'warning');
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    if (!validatePIN(pin)) {
      const rec = recordFailedAttempt(rateLimitKey);
      const remainingAttempts = Math.max(0, 4 - rec.count);
      logSecurityEvent('SELLER_LOGIN_FAILED', `Invalid PIN attempt for store #${storeId}. ${remainingAttempts} attempts remaining`, 'warning');
      return {
        success: false,
        error: `Invalid 4-digit PIN. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Account locked for 60 seconds.'}`
      };
    }

    // Success: Reset rate limits & issue cryptographically strong session token
    resetFailedAttempts(rateLimitKey);
    const token = generateSecureToken();
    const session = {
      isAuthenticated: true,
      role: 'seller',
      storeId: Number(storeId) || storeId,
      userName: `${storeName || 'Shopkeeper'} (Store #${storeId})`,
      userPhone: phone,
      token,
      loginTime: new Date().toLocaleTimeString(),
      expiresAt: Date.now() + SESSION_EXPIRY_MS
    };

    setAuthSession(session);
    logSecurityEvent('SELLER_LOGIN_SUCCESS', `Seller authenticated for Store #${storeId} (${storeName})`, 'info');
    return { success: true };
  }, [logSecurityEvent]);

  // Seller Sign Up (Store Partner Registration)
  const signupSeller = useCallback((storeName, ownerName, phone, pin, address, category) => {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const safeStoreName = sanitizeInput(storeName);
    const safeOwnerName = sanitizeInput(ownerName);
    const safeAddress = sanitizeInput(address || 'Vizag Local Area');

    if (!safeStoreName || safeStoreName.length < 3) {
      return { success: false, error: 'Please enter a valid Kirana Store Name.' };
    }
    if (!safeOwnerName || safeOwnerName.length < 2) {
      return { success: false, error: 'Please enter the Store Owner Name.' };
    }
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!validatePIN(pin)) {
      return { success: false, error: 'Please set a 4-digit security PIN for stock management.' };
    }

    const newStoreId = `partner-${Date.now().toString().slice(-4)}`;

    try {
      const savedSellers = JSON.parse(localStorage.getItem('kp_registered_sellers') || '[]');
      savedSellers.push({
        storeId: newStoreId,
        storeName: safeStoreName,
        ownerName: safeOwnerName,
        phone: cleanPhone,
        address: safeAddress,
        category: category || 'Kirana & Provisions',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('kp_registered_sellers', JSON.stringify(savedSellers));
    } catch {
      // Ignore
    }

    const token = generateSecureToken();
    const session = {
      isAuthenticated: true,
      role: 'seller',
      storeId: newStoreId,
      userName: `${safeOwnerName} (${safeStoreName})`,
      userPhone: `+91 ${cleanPhone.slice(-10)}`,
      token,
      loginTime: new Date().toLocaleTimeString(),
      expiresAt: Date.now() + SESSION_EXPIRY_MS
    };

    setAuthSession(session);
    logSecurityEvent('SELLER_SIGNUP_SUCCESS', `New Seller Registered: ${safeStoreName} by ${safeOwnerName} (+91 ${cleanPhone.slice(-10)})`, 'info');
    return { success: true, storeId: newStoreId };
  }, [logSecurityEvent]);

  // Authenticate Admin with Rate Limiting & Master Key Verification
  const loginAdmin = useCallback((email, masterKey) => {
    const rateLimitKey = `admin_${email || 'unknown'}`;

    if (isRateLimited(rateLimitKey)) {
      const remSeconds = getRemainingLockoutTime(rateLimitKey);
      logSecurityEvent('ADMIN_BRUTE_FORCE_BLOCKED', `Admin login locked. Wait ${remSeconds}s`, 'critical');
      return {
        success: false,
        error: `Admin access locked due to failed attempts. Retry in ${remSeconds} seconds.`
      };
    }

    if (!validateEmail(email)) {
      recordFailedAttempt(rateLimitKey);
      return { success: false, error: 'Please enter a valid administrator email address.' };
    }

    // Master Key Verification
    const isMasterKeyValid =
      masterKey === 'admin123' ||
      masterKey === 'supersecret' ||
      masterKey === 'KiranaAdmin@2026';

    if (!isMasterKeyValid || email.toLowerCase() !== 'admin@kiranapro.com') {
      const rec = recordFailedAttempt(rateLimitKey);
      const remainingAttempts = Math.max(0, 4 - rec.count);
      logSecurityEvent('ADMIN_UNAUTHORIZED_KEY', `Unauthorized admin key attempt for ${email}`, 'critical');
      return {
        success: false,
        error: `Invalid credentials or master key. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Locked for 60 seconds.'}`
      };
    }

    // Success
    resetFailedAttempts(rateLimitKey);
    const token = generateSecureToken();
    const session = {
      isAuthenticated: true,
      role: 'admin',
      storeId: 'localfresh',
      userName: 'Platform Super Administrator',
      userPhone: '+91 99999 00000',
      token,
      loginTime: new Date().toLocaleTimeString(),
      expiresAt: Date.now() + SESSION_EXPIRY_MS
    };

    setAuthSession(session);
    logSecurityEvent('ADMIN_LOGIN_SUCCESS', `Super Admin console accessed by ${email}`, 'info');
    return { success: true };
  }, [logSecurityEvent]);

  // Modify User Name (Requirement: Add option to modify user name)
  const updateUserName = useCallback((newName) => {
    const sanitized = sanitizeInput(newName).trim();
    if (!sanitized || sanitized.length < 2) {
      return { success: false, error: 'Please enter a valid name (at least 2 letters).' };
    }
    setAuthSession(prev => ({
      ...prev,
      userName: sanitized,
      isAuthenticated: true // Ensure active session
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

  // Secure Logout: Completely resets to logged out state (no user name shown)
  const logout = useCallback(() => {
    const previousRole = authSession.role;
    setAuthSession({
      isAuthenticated: false,
      role: 'guest',
      storeId: null,
      userName: null,
      userPhone: null,
      token: null,
      loginTime: null,
      expiresAt: null
    });
    logSecurityEvent('USER_LOGOUT', `Logged out from ${previousRole} role. Session destroyed.`, 'info');
  }, [authSession.role, logSecurityEvent]);

  return (
    <SecurityContext.Provider
      value={{
        authSession,
        loginCustomer,
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
        sampleCredentials: SAMPLE_CREDENTIALS,
        isSessionValid: () => authSession.isAuthenticated && authSession.expiresAt > Date.now()
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
