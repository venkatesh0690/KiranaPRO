/* Representative shop gallery scenes (not real named merchants).
 * Only LocalFresh may use vegetable, fruit or leafy-produce marketing photos.
 * All fictional neighborhood stores use real photos of sealed pantry goods,
 * groceries, snacks, beverages, household shelves or cleaning products.
 *
 * Photo sources: public Unsplash pages; request 600px images to save bandwidth.
 */
const thumb = id =>
  `https://unsplash.com/photos/${id}/download?force=true&w=600&h=370&q=54&fm=webp`;

export const NEIGHBORHOOD_PHOTO_GROUPS = Object.freeze({
  market: [
    ['FAziP8fKUNg', 'Shelves of packaged rice, beans and pantry staples'],
    ['3VoUDb-sVt4', 'Packaged snacks and grocery store aisles'],
    ['ivfp_yxZuYQ', 'Stocked cereal, dairy and grocery shelves'],
    ['ku-iy4fOVIQ', 'Packaged foods and bottled drinks in a convenience shop']
  ],
  // The category name may say "fresh", but non-LocalFresh store posters must
  // never depict fruit, vegetables or leafy greens.
  fresh: [
    ['FAziP8fKUNg', 'Rice and pulses displayed in sealed packages'],
    ['ivfp_yxZuYQ', 'Packaged cereal and dairy products on shelves'],
    ['Gwf6GRmkT1Y', 'Jars of spices and dry pantry goods'],
    ['ku-iy4fOVIQ', 'Shelves of boxed groceries and bottled drinks']
  ],
  snacks: [
    ['7H-CWW3rz9U', 'Indian chips and packaged snacks at a kirana shop'],
    ['3WcOJ6-JUhk', 'Packets of Indian snacks on a retail display'],
    ['3VoUDb-sVt4', 'Packaged snack displays inside a grocery shop'],
    ['ku-iy4fOVIQ', 'Beverages and packaged foods in a convenience shop']
  ],
  home: [
    ['48gk2I7mRs8', 'Household cleaning products on shop shelves'],
    ['Jj8-Q0kekCo', 'Laundry and detergent products on retail shelves'],
    ['3v5yG5u8L0Y', 'Packaged household essentials in a department store'],
    ['ivfp_yxZuYQ', 'Supermarket shelves with packaged daily necessities']
  ]
});

export function getSampleStoreImages(type,offset=0,storeName='Sample store') {
  const list=NEIGHBORHOOD_PHOTO_GROUPS[type] || NEIGHBORHOOD_PHOTO_GROUPS.market;
  return Array.from({length:3},(_,index)=>{
    const [id,description]=list[(offset+index)%list.length];
    return {
      src:thumb(id),
      alt:`Representative photograph for ${storeName}: ${description}`,
      source:`https://unsplash.com/photos/${id}`,
      photoCategory:'packaged-goods',
      isRepresentative:true
    };
  });
}
