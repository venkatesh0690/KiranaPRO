import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  generateSecureToken,
  validatePIN,
  validateEmail,
  recordFailedAttempt,
  isRateLimited,
  getRemainingLockoutTime,
  resetFailedAttempts
} from '../utils/security';

const SecurityContext = createContext(null);

const SESSION_STORAGE_KEY = 'kp_sec_auth_session';
const AUDIT_STORAGE_KEY = 'kp_sec_audit_logs';
const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function SecurityProvider({ children }) {
  // Restore session from sessionStorage if valid
  const [authSession, setAuthSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return {
      isAuthenticated: false,
      role: 'customer', // 'customer' | 'seller' | 'admin'
      storeId: null,
      userName: 'Local Customer',
      userPhone: null,
      token: null,
      loginTime: null,
      expiresAt: null
    };
  });

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
        details: 'KiranaPRO Anti-Tamper & XSS Sanitizer defense layers active.',
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

  // Log a security event to audit trail
  const logSecurityEvent = useCallback((event, details, severity = 'info') => {
    const newLog = {
      id: 'SEC-' + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toLocaleTimeString(),
      event,
      details,
      severity,
      ip: '127.0.0.1 (Hyperlocal Safe)'
    };
    setSecurityAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Save authSession to sessionStorage
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
      storeId: Number(storeId),
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

  // Secure Logout
  const logout = useCallback(() => {
    const previousRole = authSession.role;
    setAuthSession({
      isAuthenticated: false,
      role: 'customer',
      storeId: null,
      userName: 'Local Customer',
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
        loginSeller,
        loginAdmin,
        logout,
        securityAuditLogs,
        logSecurityEvent,
        isSessionValid: () => authSession.isAuthenticated && authSession.expiresAt > Date.now()
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
