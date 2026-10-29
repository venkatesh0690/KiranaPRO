# Homepage image reference layout — October 2026

The homepage is modeled on the supplied mobile reference, not on the individual store detail page.

## Layout order
1. Brand/location and full-width white outlined search bar
2. Shop by category: eight area-relevant compact colorful icon shortcuts plus a More button
3. Existing horizontal, half-height neon-photo offer carousel, with no store names or unsupported discount claims
4. Featured categories: four horizontally swipeable photo cards, corresponding to catalog categories and their real item counts
5. Stores near you: horizontally scrollable compact image-first store cards, with a working View all / Show less control. Expanded view restores filters.

The individual store product aisles are deliberately unchanged and do not display the large offer or photo sliders. The store discovery cards still have their sample photo galleries. Sample store listings do not accept checkout.

### Image sources
Category photographs are representative images obtained from Unsplash, downloaded as compressed 480px WebP crops:
- Cleaning & Pooja: https://unsplash.com/photos/x8O6wBxAbDk
- Household Staples: https://unsplash.com/photos/PDBnKupmi7E
- Personal Care: https://unsplash.com/photos/Ye9W3IVL87M
- Snacks & Munchies: https://unsplash.com/photos/ONQ86GlHs3c

These do not assert exact SKU or merchant identity.

## Validation
`npm run test:home-layout` checks all five delivery areas, real photo URLs, correct product counts, page order, category shortcut navigation and source-level CSS/markup guarantees. The production `npm run build` runs these checks with all prior discount/fulfilment tests.
