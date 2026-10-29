import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { getStoresForArea, isDeliveryArea } from './data/deliveryAreas';
import { StoreProvider, useStore } from './context/StoreContext';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { OrderHistoryProvider } from './context/OrderHistoryContext';
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
import './styles/concept-experiment.css';
import './styles/concept-category-refinement.css';
import './styles/store-photos.css';
import './styles/delivery-areas.css';
import './styles/neighborhood-highlights.css';
import './styles/unified-banner.css';
import './styles/order-rewards.css';

function MainAppShell({ userLocation, setUserLocation }) {
  const location = useLocation();
  const { authSession } = useSecurity();
  const { cart, clearCart } = useCart();
  const { stores } = useStore();
  const canShop = authSession.isAuthenticated && authSession.role === 'customer' && isDeliveryArea(userLocation);

  const chooseDeliveryArea = nextArea => {
    if (!isDeliveryArea(nextArea)) return;
    if (cart.storeId && !getStoresForArea(stores,nextArea).some(store => String(store.id) === String(cart.storeId))) {
      clearCart();
    }
    setUserLocation(nextArea);
  };

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
                onLocationSet={chooseDeliveryArea}
              />
            }
          />
          <Route
            path="/home"
            element={canShop ? <HomePage userLocation={userLocation} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/store/:id"
            element={canShop ? <StorePage userLocation={userLocation} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/search"
            element={canShop ? <SearchPage userLocation={userLocation} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/orders"
            element={canShop ? <OrdersPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/cart"
            element={canShop ? <CartPage userLocation={userLocation} /> : <Navigate to="/" replace />}
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
      <OrderHistoryProvider>
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
      </OrderHistoryProvider>
    </SecurityProvider>
  );
}
