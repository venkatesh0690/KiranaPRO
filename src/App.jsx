import { Suspense, lazy, useState } from 'react';
import { Component, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { getStoresForArea, isDeliveryArea } from './data/deliveryAreas';
import { StoreProvider, useStore } from './context/StoreContext';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { OrderHistoryProvider } from './context/OrderHistoryContext';
import { SellerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoutes';
import BottomNav from './components/BottomNav';
import CartBar from './components/CartBar';
import InstallAppBanner from './components/InstallAppBanner';
import LocationPage from './pages/LocationPage';
const HomePage = lazy(() => import('./pages/HomePage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SellerLoginPage = lazy(() => import('./pages/SellerLoginPage'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
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
import './styles/fulfilment-checkout.css';
import './styles/sample-stores-guest.css';
import './styles/editorial-banners.css';

// Load nonessential screens on demand: initial location selection no longer
// downloads cart, search, profile, seller and administrator dashboards.
function RouteLoading() {
  const [delayed,setDelayed]=useState(false);
  useEffect(()=>{
    const timer=window.setTimeout(()=>setDelayed(true),8000);
    return ()=>window.clearTimeout(timer);
  },[]);
  return <div className="kp-route-loading" role="status" aria-live="polite">
    <span className="kp-route-loading-mark" aria-hidden="true">K.</span>
    <span>{delayed?'Storefront is taking longer to open.':'Opening KiranaPRO…'}</span>
    {delayed && <button type="button"
      onClick={()=>window.location.reload()}>Retry loading</button>}
  </div>;
}

// In case a previous PWA shell references an unavailable lazy-loaded chunk,
// show a recovery action instead of trapping users behind a blank screen.
class RouteRecoveryBoundary extends Component {
  constructor(props){super(props);this.state={failed:false};}
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){
    console.error('KiranaPRO route failed to render:',error?.message||'Unknown error');
  }
  render(){
    if(this.state.failed)return <div className="kp-route-loading" role="alert">
      <span className="kp-route-loading-mark" aria-hidden="true">K.</span>
      <span>Could not open this page. Your shopping data was not cleared.</span>
      <button type="button" onClick={()=>window.location.reload()}>Reload KiranaPRO</button>
      <a href="/">Choose location again</a>
    </div>;
    return this.props.children;
  }
}

function MainAppShell({ userLocation, setUserLocation }) {
  const location = useLocation();
  const { authSession, loginTemporaryCustomer } = useSecurity();
  useEffect(() => {
    if (!authSession.isAuthenticated && typeof loginTemporaryCustomer === 'function') {
      loginTemporaryCustomer();
    }
  }, [authSession.isAuthenticated, loginTemporaryCustomer]);
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
  const isLocationRoute = location.pathname === '/location';

  return (
    <div className="app-root-wrapper full-screen-mode">
      {/* Dynamic Route Content */}
      <main
        className={`app-content-area ${
          canShop && !isPortalRoute && !isLocationRoute ? 'with-bottom-nav' : ''
        } ${isStoreRoute ? 'store-view-mode' : ''}`}
      >
        <RouteRecoveryBoundary key={location.pathname}>
        <Suspense fallback={<RouteLoading />}>
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
            element={canShop ? <ProfilePage userLocation={userLocation} /> : <Navigate to="/" replace />}
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
        </Suspense>
        </RouteRecoveryBoundary>
      </main>

      {/* PWA Install App Prompt */}
      {!isPortalRoute && !isLocationRoute && <InstallAppBanner />}

      {/* Global Floating Basket Bar */}
      {!isPortalRoute && !isLocationRoute && <CartBar />}

      {/* Bottom Navigation Bar (Customer mode only) */}
      {canShop && !isPortalRoute && !isLocationRoute && <BottomNav />}
    </div>
  );
}

export default function App() {
  // Requirement: Ask location of user whenever the app is opened (initially null)
  const [userLocation, setUserLocation] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('kp_user_location');
      if (isDeliveryArea(saved)) return saved;
    }
    return 'Siripuram';
  });

  useEffect(() => {
    if (userLocation && typeof localStorage !== 'undefined') {
      try { localStorage.setItem('kp_user_location', userLocation); } catch {}
    }
  }, [userLocation]);

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
