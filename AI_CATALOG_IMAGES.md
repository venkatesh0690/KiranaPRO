# KiranaPRO — AI-assisted catalog photography

## What is implemented
- Real verified merchant images and curated real product photos take precedence.
- Catalog photo search uses Wikimedia Commons when a curated photo is missing.
- Only when no real image matches does the app reuse a previously generated AI illustration.
- AI images are labeled **AI illustration** in the customer product UI and use a separate public Vercel Blob store.
- Generated images are indexed by normalized product name and category in the Neon table `kiranapro.catalog_ai_images`. Customer sessions never invoke the generator.
- An authenticated admin can choose a LocalFresh item without an assigned curated photo, then click **Generate and save image**. Each request is for one real catalog item; completed results are reused. Duplicate/in-flight clicks and failures have server-side cooldowns.
- Brand-bearing product names and packaging-sensitive medicine/baby/personal-care types are not eligible. No AI brand marks or fake packaging.

## Deployment
The Neon migration `security/catalog_ai_images.sql` was applied to both preview and production Neon branches. The public Blob store **kiranapro-catalog-images** is linked to the Vercel project; its server-only `BLOB_READ_WRITE_TOKEN` is configured.

**Required owner setup before images can actually be generated:**
1. Create an OpenAI API key in the official developer platform account that you choose for KiranaPRO. Image generation is metered and will incur charges.
2. In Vercel project `kiranapro` -> Settings -> Environment Variables, add `OPENAI_API_KEY` as a **sensitive server-side** value for production (and optionally preview).
3. Redeploy after configuring the key. Verify admin access is configured separately with `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` using `SECURITY_ROLLOUT.md`. Do **not** paste keys or passwords into chat, GitHub or a frontend `VITE_*` variable.
4. Sign in as admin -> open the AI product illustrations section -> choose an eligible item -> Generate and save image. The thumbnail and disclosure will appear once saved (a previously cached missing-photo response may refresh after a few minutes).
5. Check item correctness before deploying artwork at larger scale. Admin should remove/regenerate mismatched illustrations through a future moderation workflow; image generation is not an exact SKU photography substitute.

## Technical notes
- OpenAI Images API `POST /v1/images/generations`, `gpt-image-1-mini`, 1024px WebP low quality. Credentials remain only on Vercel.
- Static image reads come from Vercel Blob's CDN, not the generation endpoint.
- Preview and production use separate Neon branches. The Blob store is shared, but entries are only visible after being published in each branch's metadata table.
- Failed generation cannot overwrite published images; one-hour retry cooldown is recorded in SQL.
- No automatic batch/background generation is enabled to prevent unpredictable charges.
- The storefront will still show a neutral product fallback while there is no verified real photo and no saved AI illustration.

## Administrator first-run setup
The platform uses a single-use, time-limited setup code stored as a SHA-256 hash in
Vercel production environment variables (`ADMIN_BOOTSTRAP_TOKEN_HASH`,
`ADMIN_BOOTSTRAP_EXPIRES_AT`). Go to `/admin/login`, choose **Set up administrator
account**, and enter a unique email and strong 16+ character password. This creates
a scrypt-hashed admin account in Neon and permanently consumes the setup code.
After the first admin is created the setup option disappears. Never use a shared
demo password.

## Batch generation
The admin dashboard lists missing images based on the actual Neon catalog.
**Generate Missing Images** processes up to 6, 12, or 24 items in the browser
one at a time and shows current progress. The browser tab must remain open.
The server enforces a daily maximum of 36 new image claims and a one-hour
retry cooldown on failed attempts. Generated images are stored once in
Vercel Blob and reused by storefront visitors.
Items with a known curated real photo or seller image are skipped.
Branded/restricted items receive neutral line-art and a clearly worded
**Verified product photo pending** label, never fake packaging.

## Initial production provider result (30 October 2026)
The initial two controlled image-generation attempts failed; the confirmed
OpenAI response was **HTTP 429** (rate limit or insufficient quota).
No image was successfully published. Check the OpenAI Platform project's
usage limits, billing status, and model access before retrying through
the admin dashboard. Do not keep repeating paid requests against a 429.
The temporary signed seeding endpoint has been removed.
