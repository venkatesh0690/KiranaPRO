# 🛒 KiranaPRO — Hyperlocal Quick-Commerce & Direct Mandi Platform

[![Vite](https://img.shields.io/badge/Vite-8.3.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **KiranaPRO** connects local consumers with neighborhood kirana stores and direct-from-mandi farmers. Engineered with enterprise security, dynamic delivery SLAs, dual store views, and serverless PostgreSQL database persistence.

---

## 🌟 Key Highlights

### 1. 🥬 LocalFresh Central Mandi (Admin Managed)
- First-in-class direct-from-mandi integration managed centrally by platform admins.
- Over **108 fresh vegetables, fruits, leafy greens, pulses, and spices**.
- Transparent **+₹4 procurement pricing** directly supporting farmer partners.
- Dedicated **Within 2 hours** delivery SLA for fresh produce sorting, quality inspection, and chilled dispatch.

### 2. ⚡ Dynamic Proximity-Based Delivery SLAs
- **LocalFresh Mandi**: Within 2 hours (freshness-guaranteed picking & grading).
- **Hyper-near Stores (≤ 0.5 km)**: **Within 20 mins** lightning delivery (e.g., Sharma General Store, Sri Lakshmi Provisions).
- **Standard Neighborhood Kiranas**: **Within 30 mins** fast grocery delivery.

### 3. 👁️ Dual Store Browsing Modes
- **Grid View**: Vibrant, image-rich visual cards displaying store badges, ratings, and delivery timing.
- **Compact View**: Dense horizontal list view for high-speed ordering and bandwidth-friendly navigation.

### 4. 🛡️ Enterprise-Grade Security Architecture
- **Strict Role-Based Access Control (RBAC)**: Distinct permissions and protected routes for **Customers**, **Sellers** (`/seller/dashboard`), and **Platform Admins** (`/admin/dashboard`).
- **Brute-Force Rate Limiting**: Automatic 60-second security lockout after 4 consecutive failed authentication attempts.
- **Cart Anti-Tampering Engine**: Client and server-grade item price and quantity integrity verification preventing price manipulation.
- **PII Data Privacy**: Customer phone numbers and sensitive delivery details are masked by default (`+91 98765 *****`) with one-click audited reveals tracked in the Admin Security Log.
- **Hardened HTTP Headers**: Strict Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`.

### 5. 🐘 Neon Serverless PostgreSQL Database
- Production-ready isolated schema `kiranapro` hosted on Neon Serverless Postgres.
- Structured tables:
  - `kiranapro.stores` — Partner stores, operational status, delivery SLAs, and geolocation coordinates.
  - `kiranapro.products` — 146+ products with real-time stock levels, MRPs, discounts, and image URLs.
  - `kiranapro.orders` — JSONB order payloads with tamper-evident cryptographic integrity hashes.
  - `kiranapro.security_audit_logs` — High-fidelity logging of security events, failed logins, and PII reveals.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended, tested on v24.16.0)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/venkatesh0690/KiranaPRO.git
cd KiranaPRO
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Neon Serverless PostgreSQL Connection String
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-lively-mouse-b5rjfvsc-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
VITE_APP_ENV="production"
```

### 4. Seed Neon Database
Run the migration script to initialize the tables and seed all 108 LocalFresh items and neighborhood store inventories:
```bash
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 6. Production Build
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
KiranaPRO/
├── neon_schema.sql             # SQL schema for Neon PostgreSQL
├── vercel.json                 # Vercel SPA routing and security headers
├── package.json                # Dependencies and project scripts
├── vite.config.js              # Vite bundler configuration
├── index.html                  # Main application HTML with security meta tags
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.jsx          # Location detector, cart counter, and role nav
│   │   ├── StoreCard.jsx       # Grid & Compact view store cards
│   │   ├── ProtectedRoutes.jsx # Seller & Admin RBAC guards
│   │   └── ...
│   ├── context/                # React Context state management
│   │   ├── AuthContext.jsx     # Customer, Seller, Admin session states
│   │   ├── CartContext.jsx     # Anti-tamper cart calculations & persistence
│   │   └── SecurityContext.jsx # Rate limiter & audit logging engine
│   ├── data/                   # Static catalog datasets
│   │   ├── localfresh.js       # 108 LocalFresh items (+₹4 verified pricing)
│   │   └── stores.js           # Partner kirana stores & dynamic SLA resolver
│   ├── db/
│   │   └── neonClient.js       # Neon serverless client and query utilities
│   ├── pages/                  # Route views
│   │   ├── HomePage.jsx        # Dual-mode store listing & locality selector
│   │   ├── StorePage.jsx       # Fixed categories sidebar & live catalog
│   │   ├── CartPage.jsx        # Tamper-checked checkout & address form
│   │   ├── OrdersPage.jsx      # Order history & delivery tracking
│   │   ├── SellerDashboard.jsx # Seller stock & order management
│   │   └── AdminDashboard.jsx  # LocalFresh controls & 🔒 Security Audit Console
│   └── utils/
│       └── security.js         # Cryptographic hashing & PII masking utilities
└── scripts/
    └── neon_migrate_and_seed.js # Automated database migration and seeding
```

---

## 🌐 Deploy to Vercel

KiranaPRO is pre-configured with `vercel.json` for zero-configuration deployment to Vercel:

1. Install the Vercel CLI or link through the GitHub integration:
   ```bash
   npx vercel
   ```
2. When deploying to production:
   ```bash
   npx vercel --prod
   ```
3. Set the `DATABASE_URL` environment variable in your Vercel Project Settings for full Neon PostgreSQL integration.

---

## 📄 License
This project is licensed under the MIT License.
