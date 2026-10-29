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
- Photos request **160px** thumbnails, with optional **320px** resolution for
  high-density screens or product details. Unsplash uses WebP quality 42–50;
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
`Special:FilePath` with `width=160` or `width=320`). Click the corresponding
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

## Additional product-specific photographic matches
The product-image resolver now includes more curated commodity matches for:
- [Bitter gourd at Hyderabad market.jpg](https://commons.wikimedia.org/wiki/File:Bitter_gourd_at_Hyderabad_market.jpg)
- [Cluster bean.jpg](https://commons.wikimedia.org/wiki/File:Cluster_bean.jpg)
- [White Radish.jpg](https://commons.wikimedia.org/wiki/File:White_Radish.jpg)
- [Munaga kaayalu.JPG](https://commons.wikimedia.org/wiki/File:Munaga_kaayalu.JPG)
- [Brinjal of Tamilnadu.jpg](https://commons.wikimedia.org/wiki/File:Brinjal_of_Tamilnadu.jpg)
- [Beerakaayalu.JPG](https://commons.wikimedia.org/wiki/File:Beerakaayalu.JPG)
- [Local variety of Yam at Anandapuram 02.jpg](https://commons.wikimedia.org/wiki/File:Local_variety_of_Yam_at_Anandapuram_02.jpg)
- [Fresh curry leaves.jpg](https://commons.wikimedia.org/wiki/File:Fresh_curry_leaves.jpg)
- [Sesame-Seeds.jpg](https://commons.wikimedia.org/wiki/File:Sesame-Seeds.jpg)
- [Guava Slices.jpg](https://commons.wikimedia.org/wiki/File:Guava_Slices.jpg)
- [Avocado fruit.jpg](https://commons.wikimedia.org/wiki/File:Avocado_fruit.jpg)
- [Pomegranate fruit - whole and piece with arils.jpg](https://commons.wikimedia.org/wiki/File:Pomegranate_fruit_-_whole_and_piece_with_arils.jpg)
- [Dragon Fruit Sliced.jpg](https://commons.wikimedia.org/wiki/File:Dragon_Fruit_Sliced.jpg)

All are representative real species photographs; Commons authors and individual licenses
are on the linked file pages. Frontend images are externally hosted: rendering is
best-effort and photo load failures are replaced by a named, lightweight icon
rather than a wrong photo. This audit verifies *catalog matching rules* and small
URL parameters, not real network download success of every photo URL.

Hero-carousel product thumbnails now use the same shared audited visual component
as product cards, detail modals, and admin/seller inventory. This prevents
a previous inconsistency where a missing hero photo could create a blank card.

Merchant-supplied exact packaging images can be used only with
`verifiedImageUrl` and `imageSourceUrl` fields, after authenticity and
rights are checked. Legacy generic `image` fields are deliberately ignored.

Additional directly identified thumbnail examples (photos remain representative and linked to author/license at Wikimedia Commons): [Green zucchini](https://commons.wikimedia.org/wiki/File:Green_zucchini.jpg), [fresh ginger rhizome](https://commons.wikimedia.org/wiki/File:Fresh_ginger_rhizome_01.jpg), [sweet potato](https://commons.wikimedia.org/wiki/File:Sweet_potato_image.jpg), [green cucumbers](https://commons.wikimedia.org/wiki/File:Green_Cucumbers_1.jpg), [whole cauliflower](https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Cauliflower_from_SF_farmers%27_market.jpg), [mushrooms at a grocery store](https://commons.wikimedia.org/wiki/File:Mushrooms_in_a_cardboard_box.jpg), and [beetroots with carrots](https://commons.wikimedia.org/wiki/File:Beetroots_and_carrots.jpg).


## October 2026: Photo lookup coverage for the remaining catalog

All currently cataloged SKUs have a product-name-specific real-photo search identity. The catalog item UI does not render emoji icons as its primary product pictures.

When an image is not already curated or seller-verified, the app searches Commons via the /api/catalog-photo serverless endpoint. Only cards near the viewport request images, and Commons results are limited to small photographic thumbnails (240px). Requests are deduplicated, browser-cached and CDN-cached. Filename filters reject logos, flags, illustrations, screenshots, icons and vector images.

Regional names such as dosakaya, beerakaya, gongura, and barabati are mapped to meaningful photographic searches. For branded items, a generic ingredient or product-type photograph may be shown: it is not claimed to be an exact brand-pack photo. Each detail view links to the source/license page.

If no appropriate real photo is found, the app shows an honest 'Photo unavailable' placeholder, never a misleading photo or emoji. Exact photos of all 175 product names cannot be guaranteed without seller-supplied, SKU-confirmed photos, and external Commons availability was not visually verified for every item. No AI images are generated.

Run npm run test:photos to check search coverage, photo-only file filtering and the loading integration.
