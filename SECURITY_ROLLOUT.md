# KiranaPRO security rollout (2026-10-30)

This change replaces browser-created roles, direct Neon access and local order history with server-verified accounts and tenant-aware SQL policies. **Do not ship only the frontend code**: the database migration and server secrets are required.

## Confirmed on isolated Neon test branch
- Project `frosty-dawn-78902681`, test branch `br-twilight-dust-azqvzqya`
- Base schema plus `security/rls.sql` applied successfully in a single transaction.
- Seven marketplace/account tables: RLS enabled and FORCED.
- 13 policies created. Production main branch deliberately untouched pending review.
- No customer/store accounts or catalogs were seeded in test branch.

## Production rollout
1. Review changes and test `npm run build` and role-isolation integration on a preview deployment.
2. Configure `DATABASE_URL` as a **server-only** Vercel secret for production and preview; never use a `VITE_*` database variable. Rotate any credentials previously included in a built bundle.
3. Apply `npm run db:secure` to Neon via a privileged trusted environment (or independently apply `neon_schema.sql` then `security/rls.sql`). Verify all seven tables `relrowsecurity AND relforcerowsecurity`.
4. Seed catalog from an approved trusted migration process after schema, ensuring stock, delivery fees and customer-facing totals are correct.
5. Create a unique administrator password **outside chat**. Run `ADMIN_PASSWORD='your unique 16+ character secret' npm run security:hash-admin` locally. In Vercel set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (the output) for the server environment. Do not set the plaintext password in Vercel or check it into Git.
6. Verify real customer signup/login/logout, seller signup as pending, admin login, seller approval, customer A vs customer B order access, store A vs store B order/product mutations, public guest access, and no database URLs in the deployed JS.
7. Only then deploy to production. Update mobile (Capacitor) builds and test authenticated flows: cookie-based sessions may need explicit mobile-origin support before releasing Android.
8. Note: legacy browser-local order history cannot safely be reassigned based on a phone number. Existing demo-only order history is intentionally not migrated to SQL.

## Safety decisions
- No default admin password; admin login fails closed until the server hash is provisioned.
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
