# KiranaPRO area-specific demo stores and guest access

The five delivery areas each have four distinctive neighborhood store names plus LocalFresh. MVP Colony's four neighborhood stores include the previously configured Sri Lakshmi Provisions and three fictional samples. Nineteen fictional storefronts are **illustrative, not verified merchants** and cannot accept orders.

Each sample shop has three responsive, illustrative stock photographs in swipeable store-card and store-page galleries (Unsplash WebP thumbnails, 600px wide). The homepage banner carousel previews every store visible in the selected zone, always identifying samples as samples. Photo attribution: Unsplash; images are representative, not photographs of the named shops.

The sample customer is named **Laxman**. One-tap guest access grants a 30-minute session-only browsing mode. A guest can choose a zone, explore stores, and build a cart; guest mode does not create a verified account, share real customer order history, or save orders. Login is required to save a demo order. Seller and admin access are not affected. The regular fee and coupon rules are unchanged.

Commands: `npm run test:sample-stores`, `npm run build`.

## Product-list layout revision

The individual store's product-list page now starts directly with the category/product grid (after any sample-store warning). Its redundant full-width store-photo slideshow and offer-image carousel have been removed. Homepage featured banners, store discovery card photos, and compact product thumbnails remain available. This reduces vertical scrolling and image requests in the shop aisle screen.
