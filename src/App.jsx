import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Smartphone, Monitor } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import { SecurityProvider } from './context/SecurityContext';
import { SellerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import LocationPage from './pages/LocationPage';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CartPage from './pages/CartPage';
import SearchPage from './pages/SearchPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import SellerLoginPage from './pages/SellerLoginPage';
import SellerDashboard from './pages/SellerDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import './styles/tokens.css';
import './styles/global.css';

function MainAppShell({ userLocation, setUserLocation }) {
  const location = useLocation();
  const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'

  // Portal routes that should display in wide console mode
  const isPortalRoute =
    location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');
  const isStoreRoute = location.pathname.startsWith('/store');

  return (
    <div
      className={`app-root-wrapper ${
        deviceMode === 'mobile' && !isPortalRoute ? 'mobile-frame-mode' : 'desktop-mode'
      }`}
    >
      {/* Device View Mode Switcher for Desktop Testing (Hidden in portal views) */}
      {!isPortalRoute && (
        <div className="device-switcher-pill">
          <button
            type="button"
            className={`dswitch-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setDeviceMode('mobile')}
            title="Preview in Mobile Phone Frame"
          >
            <Smartphone size={14} />
            <span>Mobile App</span>
          </button>
          <button
            type="button"
            className={`dswitch-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setDeviceMode('desktop')}
            title="Switch to Wide Desktop View"
          >
            <Monitor size={14} />
            <span>Full Web</span>
          </button>
        </div>
      )}

      {/* Main Device / App Container */}
      <div className={`phone-chassis ${isPortalRoute ? 'portal-wide-container' : ''}`}>
        {/* Top Status Bar (Only in phone frame customer view) */}
        {deviceMode === 'mobile' && !isPortalRoute && (
          <div className="phone-status-bar">
            <span className="status-time">9:41</span>
            <div className="status-notch" />
            <div className="status-icons">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main
          className={`app-content-area ${
            userLocation && !isPortalRoute ? 'with-bottom-nav' : ''
          } ${isStoreRoute ? 'store-view-mode' : ''}`}
        >
          <Routes>
            {/* Always asks location on startup / root */}
            <Route
              path="/"
              element={
                userLocation ? (
                  <HomePage />
                ) : (
                  <LocationPage onLocationSet={setUserLocation} />
                )
              }
            />
            <Route
              path="/home"
              element={userLocation ? <HomePage /> : <Navigate to="/" />}
            />
            <Route
              path="/store/:id"
              element={userLocation ? <StorePage /> : <Navigate to="/" />}
            />
            <Route
              path="/search"
              element={userLocation ? <SearchPage /> : <Navigate to="/" />}
            />
            <Route
              path="/orders"
              element={userLocation ? <OrdersPage /> : <Navigate to="/" />}
            />
            <Route
              path="/cart"
              element={userLocation ? <CartPage /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={userLocation ? <ProfilePage /> : <Navigate to="/" />}
            />

            {/* Seller Access Routes with RBAC Protection */}
            <Route path="/seller/login" element={<SellerLoginPage />} />
            <Route
              path="/seller/dashboard"
              element={
                <SellerProtectedRoute>
                  <SellerDashboard />
                </SellerProtectedRoute>
              }
            />

            {/* Admin Access Routes with Privilege Level Protection */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Bottom Navigation Bar (Customer mode only) */}
        {userLocation && !isPortalRoute && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  // Requirement: Ask location of user whenever the app is opened (initially null)
  const [userLocation, setUserLocation] = useState(null);

  return (
    <SecurityProvider>
      <StoreProvider>
        <CartProvider>
          <BrowserRouter>
            <MainAppShell
              userLocation={userLocation}
              setUserLocation={setUserLocation}
            />
          </BrowserRouter>
        </CartProvider>
      </StoreProvider>
    </SecurityProvider>
  );
}
