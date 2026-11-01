import fs from 'fs';
import path from 'path';

const root = path.resolve('.');

// 1. Update sampleAreaStores.js: Update few stores with "Within 30 mins"
{
  const file = path.join(root, 'src/data/sampleAreaStores.js');
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const target = `      deliveryTime:'Not accepting orders',`;
  const replacement = `      deliveryTime:(index % 2 === 0) ? 'Within 30 mins' : 'Not accepting orders',`;
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code, 'utf8');
    console.log('sampleAreaStores.js: Updated deliveryTime with Within 30 mins for alternating stores');
  } else {
    console.log('sampleAreaStores.js target not found or already updated');
  }
}

// 2. Update stores.js: Ensure few stores have "Within 30 mins"
{
  const file = path.join(root, 'src/data/stores.js');
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  code = code.replace('deliveryTime: "Within 20 mins",\n    deliveryFee: 20,', 'deliveryTime: "Within 30 mins",\n    deliveryFee: 20,');
  fs.writeFileSync(file, code, 'utf8');
  console.log('stores.js updated');
}

// 3. Update HomePage.jsx:
// - Place search bar below the logo
// - In-place search: Don't open another page when search bar is clicked
// - Remove Easy Read mode (A+) button from top right
// - Hide KiranaPRO pass active details on KiranaCoin button until clicked
{
  const file = path.join(root, 'src/pages/HomePage.jsx');
  let code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  // Add search state if not present
  if (!code.includes('const [searchQuery, setSearchQuery] = useState')) {
    code = code.replace(
      'const [authMode, setAuthMode] = useState(null);',
      'const [authMode, setAuthMode] = useState(null);\n  const [searchQuery, setSearchQuery] = useState(\'\');\n  const [isSearchFocused, setIsSearchFocused] = useState(false);'
    );
  }

  // Ensure matchingProducts is defined in HomePage
  if (!code.includes('const matchingProducts = useMemo')) {
    const matchingProductsBlock = `
  // In-page live search matches without opening another page
  const matchingProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches = [];
    for (const [cat, prods] of Object.entries(products || {})) {
      for (const p of prods || []) {
        if ((p.name && p.name.toLowerCase().includes(q)) || (cat && cat.toLowerCase().includes(q))) {
          matches.push({ ...p, category: cat });
          if (matches.length >= 6) return matches;
        }
      }
    }
    return matches;
  }, [products, searchQuery]);
`;
    code = code.replace('const filteredStores = stores.filter(store => {', matchingProductsBlock + '\n  const filteredStores = stores.filter(store => {');
  }

  // Filter stores by searchQuery as well
  if (!code.includes('if (searchQuery.trim()) {')) {
    code = code.replace(
      'const filteredStores = stores.filter(store => {',
      `const filteredStores = stores.filter(store => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = store.name && store.name.toLowerCase().includes(q);
      const matchCat = (store.categories || []).some(c => c.toLowerCase().includes(q));
      const matchTag = (store.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchTag) return false;
    }`
    );
  }

  // Replace header section with: Top row (Logo left, Actions right without Easy Read mode button)
  // and Second row: Dedicated search bar below logo that doesn't navigate away
  const oldHeaderTarget = `      {/* ── Single Unified Instacart Top Bar: Brand, Search, KiranaCoins, Location, Profile, Cart ── */}
      <header className="kp-concept-header kp-instacart-unified-bar">
        <div className="kp-topbar-inner">
          {/* Brand */}
          <div className="kp-instacart-brand-wrap">
            <button
              type="button"
              className="kp-concept-wordmark"
              aria-label="KiranaPRO home"
              onClick={() => navigate('/home')}
            >
              <span className="kp-instacart-carrot-icon" aria-hidden="true">🥕</span>
              <span>kirana<span>pro</span></span>
            </button>
          </div>

          {/* Search Bar Line with Camera Icon (replacing Parchi word) */}
          <div className="kp-concept-search-line kp-topbar-search-line">
            <div className="kp-search-bar-wrap">
              <button
                type="button"
                className="kp-concept-search"
                onClick={() => navigate('/search')}
                aria-label="Search all groceries, vegetables and stores"
              >
                <Search size={16} aria-hidden="true" className="kp-concept-search-icon" />
                <span className="kp-concept-search-text">Search products and stores...</span>
                <span className="kp-concept-search-arrow"><ArrowRight size={14} aria-hidden="true" /></span>
              </button>
              <button
                type="button"
                className="kp-scan-camera-btn"
                onClick={() => setIsParchiOpen(true)}
                title="Scan paper grocery list with camera"
                aria-label="Scan paper grocery list with camera"
              >
                <Camera size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Right Controls in same bar: KiranaCoins VIP, Location, Senior Mode, Profile/Auth, Cart */}
          <div className="kp-topbar-actions">
            {/* KiranaCoins VIP Button */}
            <button
              type="button"
              className={\`kp-kiranacoins-banner \${passActive ? 'is-vip' : ''}\`}
              onClick={() => setIsPassModalOpen(true)}
              title="KiranaCoins VIP Member & Rewards"
              aria-label={\`KiranaCoins: 140 Coins. \${passActive ? 'VIP Active' : 'Activate VIP Pass'}\`}
            >
              <div className="kp-kc-coin-wrap">
                <span className="kp-kc-coin-icon">🪙</span>
              </div>
              <div className="kp-kc-info">
                <div className="kp-kc-top">
                  <span className="kp-kc-name">KiranaCoins</span>
                  <span className="kp-kc-badge">{passActive ? 'VIP' : '140'}</span>
                </div>
                <span className="kp-kc-sub">
                  {passActive ? '✓ VIP Active' : 'Worth ₹140'}
                </span>
              </div>
            </button>

            {/* Delivery location */}
            <button type="button" className="kp-concept-location" onClick={() => setIsMapOpen(true)} title="Change delivery neighborhood">
              <span className="kp-concept-pin"><MapPin size={16} strokeWidth={2.2} /></span>
              <span className="kp-concept-location-label"><strong>{userLocation || 'Choose delivery area'}</strong></span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>

            {/* Senior Mode (A+) */}
            <button
              type="button"
              className={\`kp-concept-header-icon \${seniorMode ? 'is-senior' : ''}\`}
              onClick={() => setSeniorMode(s => !s)}
              title="Senior Citizen / Easy Read Mode (A+)"
              aria-label="Toggle Senior Citizen Easy Read Mode"
              style={{ fontWeight: 850, fontSize: '13px' }}
            >
              A+
            </button>

            {/* Profile or Login/Signup */}
            {authSession?.isAuthenticated ? (
              <button
                type="button"
                className="kp-concept-header-icon"
                onClick={() => navigate('/profile')}
                aria-label="Open account"
              >
                <UserRound size={18} strokeWidth={2} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="kp-instacart-login-btn"
                  onClick={() => setAuthMode('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="kp-instacart-signup-btn"
                  onClick={() => setAuthMode('signup')}
                >
                  Sign up
                </button>
              </>
            )}

            {/* Cart Icon Button */}
            <button
              type="button"
              className="kp-concept-header-icon kp-concept-cart"
              onClick={() => navigate('/cart')}
              aria-label={\`Cart with \${totalItems} items\`}
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>`;

  const newHeader = `      {/* ── Single Unified Instacart Top Bar: Brand & Controls on Top, Search Bar Below Logo ── */}
      <header className="kp-concept-header kp-instacart-unified-bar">
        <div className="kp-topbar-inner">
          {/* Brand */}
          <div className="kp-instacart-brand-wrap">
            <button
              type="button"
              className="kp-concept-wordmark"
              aria-label="KiranaPRO home"
              onClick={() => navigate('/home')}
            >
              <span className="kp-instacart-carrot-icon" aria-hidden="true">🥕</span>
              <span>kirana<span>pro</span></span>
            </button>
          </div>

          {/* Right Controls: KiranaCoins (clean, VIP details hidden until clicked), Location, Profile/Auth, Cart */}
          <div className="kp-topbar-actions">
            {/* KiranaCoins Button - Pass active details hidden until clicked */}
            <button
              type="button"
              className="kp-kiranacoins-banner"
              onClick={() => setIsPassModalOpen(true)}
              title="KiranaCoins Rewards"
              aria-label="KiranaCoins: 140 Coins. Worth ₹140"
            >
              <div className="kp-kc-coin-wrap">
                <span className="kp-kc-coin-icon">🪙</span>
              </div>
              <div className="kp-kc-info">
                <div className="kp-kc-top">
                  <span className="kp-kc-name">KiranaCoins</span>
                  <span className="kp-kc-badge">140</span>
                </div>
                <span className="kp-kc-sub">Worth ₹140</span>
              </div>
            </button>

            {/* Delivery location */}
            <button type="button" className="kp-concept-location" onClick={() => setIsMapOpen(true)} title="Change delivery neighborhood">
              <span className="kp-concept-pin"><MapPin size={16} strokeWidth={2.2} /></span>
              <span className="kp-concept-location-label"><strong>{userLocation || 'Choose delivery area'}</strong></span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>

            {/* Profile or Login/Signup */}
            {authSession?.isAuthenticated ? (
              <button
                type="button"
                className="kp-concept-header-icon"
                onClick={() => navigate('/profile')}
                aria-label="Open account"
              >
                <UserRound size={18} strokeWidth={2} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="kp-instacart-login-btn"
                  onClick={() => setAuthMode('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className="kp-instacart-signup-btn"
                  onClick={() => setAuthMode('signup')}
                >
                  Sign up
                </button>
              </>
            )}

            {/* Cart Icon Button */}
            <button
              type="button"
              className="kp-concept-header-icon kp-concept-cart"
              onClick={() => navigate('/cart')}
              aria-label={\`Cart with \${totalItems} items\`}
            >
              <ShoppingBag size={18} strokeWidth={2} />
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>
          </div>
        </div>

        {/* Dedicated Search Bar Line Placed Below Logo - In-Place Search (Doesn't open another page) */}
        <div className="kp-concept-search-line kp-home-dedicated-search">
          <div className="kp-search-bar-wrap">
            <Search size={16} aria-hidden="true" className="kp-concept-search-icon" />
            <input
              type="text"
              className="kp-home-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder="Search products and stores..."
              aria-label="Search all groceries, vegetables and stores"
            />
            {searchQuery && (
              <button
                type="button"
                className="kp-search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="button"
              className="kp-scan-camera-btn"
              onClick={() => setIsParchiOpen(true)}
              title="Scan paper grocery list with camera"
              aria-label="Scan paper grocery list with camera"
            >
              <Camera size={15} strokeWidth={2.2} />
            </button>
          </div>

          {/* Instant live search results dropdown on Home without opening another page */}
          {isSearchFocused && searchQuery.trim() && matchingProducts.length > 0 && (
            <div className="kp-home-search-dropdown" role="listbox">
              <div className="kp-hsd-header">Matching items in {userLocation}</div>
              {matchingProducts.map((p) => (
                <div
                  key={p.id}
                  className="kp-hsd-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addItem(p.storeId || 'localfresh', p);
                  }}
                >
                  <span className="kp-hsd-name">{p.name}</span>
                  <span className="kp-hsd-unit">{p.unit || ''}</span>
                  <span className="kp-hsd-price">₹{p.price}</span>
                  <button type="button" className="kp-hsd-add-btn">+ Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>`;

  // Make sure X is imported from lucide-react in HomePage.jsx
  if (!code.includes(' X,')) {
    code = code.replace("import {\n  ArrowRight,", "import {\n  X,\n  ArrowRight,");
  }

  if (code.includes(oldHeaderTarget)) {
    code = code.replace(oldHeaderTarget, newHeader);
    fs.writeFileSync(file, code, 'utf8');
    console.log('HomePage.jsx: Placed search bar below logo, removed Easy Read mode, and hid VIP details on button');
  } else {
    console.error('HomePage.jsx: oldHeaderTarget not found');
  }
}

// 4. Update instacart-theme.css
{
  const file = path.join(root, 'src/styles/instacart-theme.css');
  let css = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

  // Add styles for kp-home-dedicated-search and kp-home-search-input and dropdown
  const dedicatedSearchCss = `
/* ── Dedicated Search Bar Below Logo ── */
.kp-home-dedicated-search {
  max-width: 1440px !important;
  margin: 10px auto 0 !important;
  padding: 0 !important;
  width: 100% !important;
  position: relative !important;
}

.kp-home-dedicated-search .kp-search-bar-wrap {
  height: 42px !important;
  min-height: 42px !important;
  max-height: 42px !important;
  background: var(--insta-surface-subtle) !important;
  border: 1.5px solid var(--insta-border) !important;
  border-radius: var(--insta-radius-pill) !important;
  padding: 0 6px 0 16px !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
  transition: all 0.2s ease !important;
}

.kp-home-dedicated-search .kp-search-bar-wrap:focus-within {
  border-color: var(--insta-emerald) !important;
  background: #FFFFFF !important;
  box-shadow: 0 0 0 3px rgba(16, 137, 16, 0.15) !important;
}

.kp-home-search-input {
  flex: 1 !important;
  border: none !important;
  background: transparent !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #111827 !important;
  outline: none !important;
  padding: 0 10px !important;
  height: 100% !important;
}

.kp-home-search-input::placeholder {
  color: #6B7280 !important;
}

.kp-search-clear-btn {
  background: none !important;
  border: none !important;
  color: #6B7280 !important;
  cursor: pointer !important;
  padding: 4px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  margin-right: 4px !important;
}

.kp-search-clear-btn:hover {
  background: #E5E7EB !important;
  color: #111827 !important;
}

.kp-home-search-dropdown {
  position: absolute !important;
  top: calc(100% + 6px) !important;
  left: 0 !important;
  right: 0 !important;
  background: #FFFFFF !important;
  border-radius: 14px !important;
  border: 1px solid #E5E7EB !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
  z-index: 200 !important;
  overflow: hidden !important;
  max-height: 320px !important;
  overflow-y: auto !important;
}

.kp-hsd-header {
  font-size: 11px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  color: #6B7280 !important;
  padding: 10px 14px 6px !important;
  border-bottom: 1px solid #F3F4F6 !important;
}

.kp-hsd-item {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 14px !important;
  cursor: pointer !important;
  transition: background 0.15s ease !important;
  border-bottom: 1px solid #F9FAFB !important;
  gap: 10px !important;
}

.kp-hsd-item:hover {
  background: #F0FDF4 !important;
}

.kp-hsd-name {
  flex: 1 !important;
  font-size: 13.5px !important;
  font-weight: 700 !important;
  color: #111827 !important;
}

.kp-hsd-unit {
  font-size: 12px !important;
  color: #6B7280 !important;
}

.kp-hsd-price {
  font-size: 13.5px !important;
  font-weight: 850 !important;
  color: var(--insta-emerald) !important;
}

.kp-hsd-add-btn {
  background: var(--insta-emerald) !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 5px 12px !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  cursor: pointer !important;
}
`;

  css += '\n' + dedicatedSearchCss;
  fs.writeFileSync(file, css, 'utf8');
  console.log('instacart-theme.css: Added styles for dedicated search below logo');
}
