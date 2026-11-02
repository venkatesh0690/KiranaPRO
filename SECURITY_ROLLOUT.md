# KiranaPRO security rollout (2026-10-30)

This change replaces browser-created roles, direct Neon access and local order history with server-verified accounts and tenant-aware SQL policies. **Do not ship only the frontend code**: the database migration and server secrets are required.

## Confirmed on isolated Neon test branch
- Project `frosty-dawn-78902681`, test branch `br-twilight-dust-azqvzqya`
- Base schema plus `security/rls.sql` applied successfully in a single transaction.
- Seven marketplace/account tables: RLS enabled and FORCED. The API explicitly switches to `kiranapro_rls_api` (NOLOGIN, NOBYPASSRLS) for each SQL transaction.
- 13 policies created. Production Neon main branch was migrated on October 30, 2026; one LocalFresh store and 108 products seeded.
- No customer/store accounts or catalogs were seeded in test branch.

## Production rollout
1. Preview deployment build and regression tests have passed. Isolated SQL tests verified customers cannot access another customer's order, sellers cannot access/update another store, and guests cannot see private orders after SET LOCAL ROLE.
2. `DATABASE_URL` has been configured as a **server-only** Vercel secret: Neon main for production; isolated branch for preview. Never use `VITE_*` for DB credentials. Rotate any credentials previously included in a built bundle.
3. Production migration has been applied and verified. New environments can use `npm run db:secure` with a trusted migration role.
4. Production catalog has been initialized with LocalFresh only (108 products). Fictional neighborhood shops were not written as live merchants. Changes to daily prices must not be overwritten during bootstrap.
5. Administrator accounts must be explicitly created through the single-use, expiring `/api/admin-setup` flow. Generate a random 48-character hexadecimal code outside chat, store only its SHA-256 digest in `ADMIN_BOOTSTRAP_TOKEN_HASH` and an expiration in `ADMIN_BOOTSTRAP_EXPIRES_AT`, then complete setup with a unique 16+ character password. Never check the code or plaintext password into source. The main database already had one approved administrator and one consumed bootstrap claim on November 2, 2026.
6. Verify real customer signup/login/logout, seller signup as pending, admin login, seller approval, customer A vs customer B order access, store A vs store B order/product mutations, public guest access, and no database URLs in the deployed JS.
7. Deploy reviewed and built Git commit to production. The web app is the immediate release target. Do **not** distribute a new Android/Capacitor build until its app-origin cookie behavior is separately verified.
8. Legacy browser-local order history cannot safely be reassigned based on a phone number. Existing demo-only orders are intentionally not migrated to SQL.

## Safety decisions
- No default admin password; the legacy `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` login-provisioning fallback has been removed. Existing approved administrator accounts continue to sign in through the normal server-verified login.
- Existing local demo passwords and 4-digit PINs do not grant server access.
- Seller registration is pending manual admin approval.
- Guest mode only previews browsing; it is not a server identity.
- API pricing, discounts, fulfillment and order ownership are computed or verified on the server.
- No claim of production security is made until deployment and live penetration checks succeed.

## Additional hardening before real payments
- Replace illustrative estimated GST with category-based GST rules.
- Add server-derived location availability, stock reservation and idempotent checkout.
- Add robust distributed IP/account signup rate limiting, password reset/OTP, immutable security logging, and session rotation.
- Harden origin validation for the Android Capacitor app; avoid weakening same-origin rules to allow wildcard origins.
- Migrate authorization to a least-privilege non-owner database role after provisioning privileges safely.

## Security status review (2026-11-02)
- Verified the production Neon project has nine tables with RLS both enabled and forced, and policies defined on each table. The application RLS role is NOLOGIN and NOBYPASSRLS.
- Production database reported one approved admin, zero approved sellers and zero orders. Cross-tenant order checks with real distinct accounts cannot be completed until suitable test accounts and orders exist.
- The admin Security panel now offers an authenticated, read-only check of RLS configuration and application database role. These checks do not constitute a complete penetration test.
- Client-local activity is labelled as such; it must not be represented as server audit records, verified IPs or a comprehensive vulnerability scan.
- Vercel response headers now restrict embedded objects, HTML base URLs, framing and form destinations, and enable HSTS. A full allowlist-style CSP, persistent server audit events and externally verified tenant integration tests remain follow-up work.

## Owner follow-up
Existing administrator credentials stay unchanged. Protect the administrator account with a unique password. A separate secure password-reset workflow is needed before administrators can rotate it themselves. Never post credentials in chat, GitHub or issue trackers.
