# KiranaPRO product imagery audit

## Scope
All catalog products (LocalFresh plus the neighborhood-store catalog) now use the
same product-name-based visual resolver for product tiles, modal detail, cart,
seller inventory, admin inventory, and homepage offer products.

- Removed 283 unreviewed, often repeated stock-image URLs from catalog records.
  No images are automatically fetched from those old `product.image` fields.
- Only specifically matched, representative commodity photographs are displayed.
- Branded packaged items, pickles, flowers and uncommon local vegetables use
  clear item-labelled emoji illustrations when an exact, authorized photograph
  has not yet been supplied; no incorrect brand/package substitutes.
- Photos request **240px** assets, with optional **420px** resolution at higher
  density or on detail views. Unsplash photos use WebP and quality 52–56;
  Wikimedia's width parameter requests reduced-size thumbnails.
- Lazy loading, async decoding, responsive widths and graceful fallback are
  applied consistently. Repeated photos are browser-cacheable.
- User-contributed product images require a separate verification and image
  optimization process before direct use.
- Real product photographs of exact packaged SKUs should be uploaded by
  authorized shop owners to replace representative icons.

## Real-image sources
Real stock photographs for common raw produce come from **Unsplash**
(https://unsplash.com/license), with photo IDs in `catalogVisual.js`. These
are representative commodity photos, not actual photos of the store's stock.

Verified Wikimedia Commons file page links (all thumbnails are fetched through
`Special:FilePath` with `width=240` or `width=420`). Click the corresponding
photo source/license link in the full product detail for licensing and attribution:

- [India Ash Gourd.jpg](https://commons.wikimedia.org/wiki/File:India_Ash_Gourd.jpg)
- [Pointed gourd 20220828 165712.jpg](https://commons.wikimedia.org/wiki/File:Pointed_gourd_20220828_165712.jpg)
- [Lady fingers at Gara market, Srikakulam.jpg](https://commons.wikimedia.org/wiki/File:Lady_fingers_at_Gara_market,_Srikakulam.jpg)
- [Bottle gourd in andhra farm.jpg](https://commons.wikimedia.org/wiki/File:Bottle_gourd_in_andhra_farm.jpg)
- [Ridge Gourd Southern India.jpg](https://commons.wikimedia.org/wiki/File:Ridge_Gourd_Southern_India.jpg)
- [Ivy gourd.jpg](https://commons.wikimedia.org/wiki/File:Ivy_gourd.jpg)
- [Carrots ooty.JPG](https://commons.wikimedia.org/wiki/File:Carrots_ooty.JPG)
- [Coriander Leaves.jpg](https://commons.wikimedia.org/wiki/File:Coriander_Leaves.jpg)
- [Chana Dal (split Bengal gram).JPG](https://commons.wikimedia.org/wiki/File:Chana_Dal_(split_Bengal_gram).JPG)
- [Chitra Rajma.jpg](https://commons.wikimedia.org/wiki/File:Chitra_Rajma.jpg)
- [Green-chillies.jpg](https://commons.wikimedia.org/wiki/File:Green-chillies.jpg)

Wikimedia files are individually licensed, frequently under CC BY or CC BY-SA:
follow attribution and derivative obligations as stated at each source before
rehosting or editing any photograph. URLs are externally hosted and may become
unavailable. When loading fails, a named item illustration is displayed instead.

## Next steps for full photographic coverage
Photographic coverage remains intentionally partial. To show an exact image for
**every product**, collect authorized seller/mandi photos and verify each image
against the product ID, variety, brand, pack size and merchandising description.
Then generate small WebP/AVIF variants and serve them from an image CDN.
The current catalog does NOT claim that every emoji fallback is a photograph.

## Regression testing
Run `npm run test:catalog`; the production Vite build also runs this test.
