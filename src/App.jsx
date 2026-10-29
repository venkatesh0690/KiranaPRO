import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './context/StoreContext';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { SellerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoutes';
import BottomNav from './components/BottomNav';
import InstallAppBanner from './components/InstallAppBanner';
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
import './styles/minimal.css';
import './styles/gallery.css';
import './styles/unified.css';
import './styles/onboarding.css';
import './styles/store-transitions.css';
import './styles/store-experience.css';
import './styles/home-refinement.css';
import './styles/home-polish.css';
import './styles/catalog-integrity.css';

function MainAppShell({ userLocation, setUserLocation }) {
  const location = useLocation();
  const { authSession } = useSecurity();
  const canShop = authSession.isAuthenticated && authSession.role === 'customer' && Boolean(userLocation);

  // Portal routes use their own navigation
  const isPortalRoute =
    location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');
  const isStoreRoute = location.pathname.startsWith('/store');
  const isLocationRoute = location.pathname === '/';

  return (
    <div className="app-root-wrapper full-screen-mode">
      {/* Dynamic Route Content */}
      <main
        className={`app-content-area ${
          canShop && !isPortalRoute && !isLocationRoute ? 'with-bottom-nav' : ''
        } ${isStoreRoute ? 'store-view-mode' : ''}`}
      >
        <Routes>
          {/* Always asks location on startup / root */}
          <Route
            path="/"
            element={
              <LocationPage
                initialLocation={userLocation || ''}
                onLocationSet={setUserLocation}
              />
            }
          />
          <Route
            path="/home"
            element={canShop ? <HomePage userLocation={userLocation} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/store/:id"
            element={canShop ? <StorePage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/search"
            element={canShop ? <SearchPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/orders"
            element={canShop ? <OrdersPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/cart"
            element={canShop ? <CartPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={canShop ? <ProfilePage /> : <Navigate to="/" replace />}
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

      {/* PWA Install App Prompt */}
      {!isPortalRoute && !isLocationRoute && <InstallAppBanner />}

      {/* Bottom Navigation Bar (Customer mode only) */}
      {canShop && !isPortalRoute && !isLocationRoute && <BottomNav />}
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
