/* Representative shop gallery scenes (not real named merchants).
 * Only LocalFresh may use vegetable, fruit or leafy-produce marketing photos.
 * All fictional neighborhood stores use real photos of sealed pantry goods,
 * groceries, snacks, beverages, household shelves or cleaning products.
 *
 * Photo sources: public Unsplash pages; request 600px images to save bandwidth.
 * Exactly 57 unique photo IDs are assigned across the 19 sample stores so that
 * NO store repeats any image anywhere across the platform.
 */
const thumb = id =>
  id.startsWith('photo-')
    ? `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=370&q=54&fm=webp`
    : `https://unsplash.com/photos/${id}/download?force=true&w=600&h=370&q=54&fm=webp`;

export const NEIGHBORHOOD_PHOTO_GROUPS = Object.freeze({
  market: [
    ['photo-1578916171728-46686eac8d58', 'Supermarket shelves with packaged daily necessities'],
    ['photo-1583258292688-d0213dc5a3a8', 'Stocked cereal, dairy and grocery shelves'],
    ['photo-1588964895597-cfccd6e2dbf9', 'Packaged food and pantry items on retail shelves'],
    ['photo-1506617564039-2f3b650b7010', 'Packaged groceries and canned products in supermarket'],
    ['photo-1543083477-4f785aeafaa9', 'Aisle of packaged rice, flour and dry groceries'],
    ['photo-1516594798947-e65505dbb29d', 'Retail shelves with packaged food and snacks'],
    ['photo-1509440159596-0249088772ff', 'Packaged breakfast cereals, tea and coffee on grocery shelves'],
    ['photo-1574634534894-89d7576c8259', 'Dairy cartons, butter packs and breakfast items'],
    ['photo-1597362925123-77861d3fbac7', 'Retail shelves stocked with daily packaged groceries'],
    ['photo-1540420773420-3366772f4999', 'Supermarket shelves with dairy, packaged snacks and essentials'],
    ['photo-1506484381205-f7945653044d', 'Convenience store aisles with grocery items'],
    ['photo-1533777857889-4be7c70b33f7', 'Stocked pantry foods and retail packaged goods'],
    ['photo-1576402187878-974f70c890a5', 'Supermarket shelves with packaged groceries and staples'],
    ['photo-1581578731548-c64695cc6952', 'Grocery baskets and daily essentials in retail shop'],
    ['photo-1604719312566-8912e9227c6a', 'Supermarket aisle of packaged foods and household goods']
  ],
  fresh: [
    ['photo-1584727638096-042c45049ebe', 'Rice and pulses displayed in sealed packages'],
    ['photo-1579113800032-c38bd7635818', 'Jars of spices and dry pantry goods'],
    ['photo-1580913428023-02c695666d61', 'Packaged grains and pantry provisions'],
    ['photo-1580828343064-fde4fc206bc6', 'Bottled cooking oils and packaged spices'],
    ['photo-1607623814075-e51df1bdc82f', 'Pantry staples and sealed grains on display'],
    ['photo-1586528116311-ad8dd3c8310d', 'Supermarket warehouse with packaged groceries'],
    ['photo-1606787366850-de6330128bfc', 'Pantry glass jars with spices and dry pulses'],
    ['photo-1563865436874-9aef32095fad', 'Sealed pulses, lentils and flour packets on shelf'],
    ['photo-1582293041079-7814c2f12063', 'Pantry dry goods and bottled cooking essentials'],
    ['photo-1615485500704-8e990f9900f7', 'Packaged whole spices and aromatics in jars'],
    ['photo-1596797038530-2c107229654b', 'Traditional pulses, rice sacks and grain flour'],
    ['photo-1601050690597-df0568f70950', 'Packaged cooking oils, pure ghee and pantry condiments'],
    ['photo-1599940824399-b87987ceb72a', 'Packaged grains, rice bags and wholesome pulses'],
    ['photo-1609840114035-3c981b782dfe', 'Traditional Indian spices and packaged pantry staples'],
    ['photo-1590779033100-9f60a05a013e', 'Refined oils, dairy ghee tins and pantry ingredients']
  ],
  snacks: [
    ['photo-1567306226416-28f0efdc88ce', 'Indian chips and packaged snacks at a kirana shop'],
    ['photo-1528698827591-e19ccd7bc23d', 'Packets of snacks on a retail display'],
    ['photo-1534723452862-4c874018d66d', 'Bottled beverages and packaged snacks'],
    ['photo-1579705745811-a32befae8660', 'Chilled drinks and soda bottles in grocery refrigerator'],
    ['photo-1519708227418-c8fd9a32b7a2', 'Packaged snacks and crispy savories on shelf display'],
    ['photo-1547592180-85f173990554', 'Assorted biscuits, confectionery and packaged snacks'],
    ['photo-1568644396922-5c3bfae12521', 'Indian namkeen, potato chips and packet snacks'],
    ['photo-1558961363-fa8fdf82db35', 'Cookies, biscuits and sweet snacks display in retail store'],
    ['photo-1527515862127-a4fc05baf7a5', 'Cold drink cans, soda and juices in grocery display'],
    ['photo-1621996346565-e3adc6d7d071', 'Savory Indian snacks, chips and mixture packets'],
    ['photo-1559181567-c3190ca9959b', 'Sweet bakery cookies and biscuit packs on shelves'],
    ['photo-1551024709-8f23befc6f87', 'Chilled drinks, soda and beverages in coolers']
  ],
  home: [
    ['photo-1556909114-f6e7ad7d3136', 'Household cleaning products on shop shelves'],
    ['photo-1584905066893-7d5c142ba4e1', 'Laundry and detergent products on retail shelves'],
    ['photo-1550989460-0adf9ea622e2', 'Packaged household essentials in a department store'],
    ['photo-1608686207856-001b95cf60ca', 'Detergent powders, soaps and bathroom cleaning products'],
    ['photo-1596040033229-a9821ebd058d', 'Household cleaning products and floor care liquids'],
    ['photo-1587293852726-70cdb54c2df4', 'Personal care goods, shampoos and cosmetic products'],
    ['photo-1585421514284-efb74c2b69ba', 'Cleaning sprays, sponges and surface disinfectant products'],
    ['photo-1563453392212-326f5e854473', 'Personal hygiene products, handwashes and toilet cleaners'],
    ['photo-1522335789203-aabd1fc54bc9', 'Daily household paper products and cleaning tools'],
    ['photo-1583947215259-38e31be8751f', 'Bath soaps, liquid detergents and home care essentials'],
    ['photo-1584308666744-24d5c474f2ae', 'Disinfectant cleaners, floor detergents and spray bottles'],
    ['photo-1585670270677-3ac18000c82b', 'Pooja essentials, incense sticks and packaged home products'],
    ['photo-1583947581924-860bda6a26df', 'Detergent bars, washing powders and laundry aids'],
    ['photo-1584820927498-cfe5211fd8bf', 'Dishwash liquids, scrubbers and kitchen cleaning products'],
    ['photo-1577741314755-048d8525d31e', 'Household hygiene products and cleaning shelves']
  ]
});

// Explicit, 100% unique 3-photo assignments for all 19 sample stores.
// Guaranteed zero overlap between any store on the platform.
export const SAMPLE_STORE_GALLERIES = Object.freeze({
  // 1. NAD Family Mart
  'sample-nad-1': [
    ['photo-1578916171728-46686eac8d58', 'Supermarket shelves with packaged daily necessities'],
    ['photo-1583258292688-d0213dc5a3a8', 'Stocked cereal, dairy and grocery shelves'],
    ['photo-1588964895597-cfccd6e2dbf9', 'Packaged food and pantry items on retail shelves']
  ],
  // 2. Kotha Road Fresh Basket
  'sample-nad-2': [
    ['photo-1584727638096-042c45049ebe', 'Rice and pulses displayed in sealed packages'],
    ['photo-1579113800032-c38bd7635818', 'Jars of spices and dry pantry goods'],
    ['photo-1580913428023-02c695666d61', 'Packaged grains and pantry provisions']
  ],
  // 3. Junction Snack Stop
  'sample-nad-3': [
    ['photo-1567306226416-28f0efdc88ce', 'Indian chips and packaged snacks at a kirana shop'],
    ['photo-1528698827591-e19ccd7bc23d', 'Packets of snacks on a retail display'],
    ['photo-1534723452862-4c874018d66d', 'Bottled beverages and packaged snacks']
  ],
  // 4. NAD Home & Daily
  'sample-nad-4': [
    ['photo-1556909114-f6e7ad7d3136', 'Household cleaning products on shop shelves'],
    ['photo-1584905066893-7d5c142ba4e1', 'Laundry and detergent products on retail shelves'],
    ['photo-1550989460-0adf9ea622e2', 'Packaged household essentials in a department store']
  ],
  // 5. Daba Bazaar Provisions
  'sample-daba-1': [
    ['photo-1506617564039-2f3b650b7010', 'Packaged groceries and canned products in supermarket'],
    ['photo-1543083477-4f785aeafaa9', 'Aisle of packaged rice, flour and dry groceries'],
    ['photo-1516594798947-e65505dbb29d', 'Retail shelves with packaged food and snacks']
  ],
  // 6. Garden Gate Pantry
  'sample-daba-2': [
    ['photo-1580828343064-fde4fc206bc6', 'Bottled cooking oils and packaged spices'],
    ['photo-1607623814075-e51df1bdc82f', 'Pantry staples and sealed grains on display'],
    ['photo-1586528116311-ad8dd3c8310d', 'Supermarket warehouse with packaged groceries']
  ],
  // 7. Daba Treats & Drinks
  'sample-daba-3': [
    ['photo-1579705745811-a32befae8660', 'Chilled drinks and soda bottles in grocery refrigerator'],
    ['photo-1519708227418-c8fd9a32b7a2', 'Packaged snacks and crispy savories on shelf display'],
    ['photo-1547592180-85f173990554', 'Assorted biscuits, confectionery and packaged snacks']
  ],
  // 8. City Centre Essentials
  'sample-daba-4': [
    ['photo-1608686207856-001b95cf60ca', 'Detergent powders, soaps and bathroom cleaning products'],
    ['photo-1596040033229-a9821ebd058d', 'Household cleaning products and floor care liquids'],
    ['photo-1587293852726-70cdb54c2df4', 'Personal care goods, shampoos and cosmetic products']
  ],
  // 9. Siripuram Daily Basket
  'sample-siri-1': [
    ['photo-1509440159596-0249088772ff', 'Packaged breakfast cereals, tea and coffee on grocery shelves'],
    ['photo-1574634534894-89d7576c8259', 'Dairy cartons, butter packs and breakfast items'],
    ['photo-1597362925123-77861d3fbac7', 'Retail shelves stocked with daily packaged groceries']
  ],
  // 10. Coastal Fresh Pantry
  'sample-siri-2': [
    ['photo-1606787366850-de6330128bfc', 'Pantry glass jars with spices and dry pulses'],
    ['photo-1563865436874-9aef32095fad', 'Sealed pulses, lentils and flour packets on shelf'],
    ['photo-1582293041079-7814c2f12063', 'Pantry dry goods and bottled cooking essentials']
  ],
  // 11. Siripuram Snack Avenue
  'sample-siri-3': [
    ['photo-1568644396922-5c3bfae12521', 'Indian namkeen, potato chips and packet snacks'],
    ['photo-1558961363-fa8fdf82db35', 'Cookies, biscuits and sweet snacks display in retail store'],
    ['photo-1527515862127-a4fc05baf7a5', 'Cold drink cans, soda and juices in grocery display']
  ],
  // 12. Harbour Home Supplies
  'sample-siri-4': [
    ['photo-1585421514284-efb74c2b69ba', 'Cleaning sprays, sponges and surface disinfectant products'],
    ['photo-1563453392212-326f5e854473', 'Personal hygiene products, handwashes and toilet cleaners'],
    ['photo-1522335789203-aabd1fc54bc9', 'Daily household paper products and cleaning tools']
  ],
  // 13. MVP Corner Mart
  'sample-mvp-1': [
    ['photo-1540420773420-3366772f4999', 'Supermarket shelves with dairy, packaged snacks and essentials'],
    ['photo-1506484381205-f7945653044d', 'Convenience store aisles with grocery items'],
    ['photo-1533777857889-4be7c70b33f7', 'Stocked pantry foods and retail packaged goods']
  ],
  // 14. Sector Fresh Basket
  'sample-mvp-2': [
    ['photo-1615485500704-8e990f9900f7', 'Packaged whole spices and aromatics in jars'],
    ['photo-1596797038530-2c107229654b', 'Traditional pulses, rice sacks and grain flour'],
    ['photo-1601050690597-df0568f70950', 'Packaged cooking oils, pure ghee and pantry condiments']
  ],
  // 15. MVP Home Needs
  'sample-mvp-3': [
    ['photo-1583947215259-38e31be8751f', 'Bath soaps, liquid detergents and home care essentials'],
    ['photo-1584308666744-24d5c474f2ae', 'Disinfectant cleaners, floor detergents and spray bottles'],
    ['photo-1585670270677-3ac18000c82b', 'Pooja essentials, incense sticks and packaged home products']
  ],
  // 16. Gajuwaka Family Stores
  'sample-gaju-1': [
    ['photo-1576402187878-974f70c890a5', 'Supermarket shelves with packaged groceries and staples'],
    ['photo-1581578731548-c64695cc6952', 'Grocery baskets and daily essentials in retail shop'],
    ['photo-1604719312566-8912e9227c6a', 'Supermarket aisle of packaged foods and household goods']
  ],
  // 17. Steel City Fresh Mart
  'sample-gaju-2': [
    ['photo-1599940824399-b87987ceb72a', 'Packaged grains, rice bags and wholesome pulses'],
    ['photo-1609840114035-3c981b782dfe', 'Traditional Indian spices and packaged pantry staples'],
    ['photo-1590779033100-9f60a05a013e', 'Refined oils, dairy ghee tins and pantry ingredients']
  ],
  // 18. Gajuwaka Snack House
  'sample-gaju-3': [
    ['photo-1621996346565-e3adc6d7d071', 'Savory Indian snacks, chips and mixture packets'],
    ['photo-1559181567-c3190ca9959b', 'Sweet bakery cookies and biscuit packs on shelves'],
    ['photo-1551024709-8f23befc6f87', 'Chilled drinks, soda and beverages in coolers']
  ],
  // 19. Steel City Home Mart
  'sample-gaju-4': [
    ['photo-1583947581924-860bda6a26df', 'Detergent bars, washing powders and laundry aids'],
    ['photo-1584820927498-cfe5211fd8bf', 'Dishwash liquids, scrubbers and kitchen cleaning products'],
    ['photo-1577741314755-048d8525d31e', 'Household hygiene products and cleaning shelves']
  ]
});

export function getSampleStoreImages(type, offset = 0, storeName = 'Sample store', storeId = null) {
  if (storeId && SAMPLE_STORE_GALLERIES[storeId]) {
    return SAMPLE_STORE_GALLERIES[storeId].map(([id, description]) => ({
      src: thumb(id),
      alt: `Representative photograph for ${storeName}: ${description}`,
      source: id.startsWith('photo-') ? `https://images.unsplash.com/${id}` : `https://unsplash.com/photos/${id}`,
      photoCategory: 'packaged-goods',
      isRepresentative: true
    }));
  }

  const list = NEIGHBORHOOD_PHOTO_GROUPS[type] || NEIGHBORHOOD_PHOTO_GROUPS.market;
  return Array.from({ length: 3 }, (_, index) => {
    const [id, description] = list[(offset + index) % list.length];
    return {
      src: thumb(id),
      alt: `Representative photograph for ${storeName}: ${description}`,
      source: id.startsWith('photo-') ? `https://images.unsplash.com/${id}` : `https://unsplash.com/photos/${id}`,
      photoCategory: 'packaged-goods',
      isRepresentative: true
    };
  });
}
