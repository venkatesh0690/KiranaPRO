/* Demo-store photograph sets: representative scenes, never verified storefronts.
 * Optimized, remotely hosted Unsplash images, with area-specific slide order.
 * Do not use these images to assert a demo merchant is real or accepting orders.
 */
const thumb=(id)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=370&q=58&fm=webp`;
const PHOTO_GROUPS=Object.freeze({
  market:[
    ['photo-1578916171728-46686eac8d58','Neighborhood grocery market shelves'],
    ['photo-1542838132-92c53300491e','Fresh produce in a grocery market'],
    ['photo-1604719312566-8912e9227c6a','Assorted grocery shelves'],
    ['photo-1606787366850-de6330128bfc','Pantry and food essentials']
  ],
  fresh:[
    ['photo-1542838132-92c53300491e','Fresh vegetables at market'],
    ['photo-1590779033100-9f60a05a013d','Produce display'],
    ['photo-1578916171728-46686eac8d58','Fresh grocery market'],
    ['photo-1606787366850-de6330128bfc','Food and pantry selection']
  ],
  snacks:[
    ['photo-1604719312566-8912e9227c6a','Food shop shelves and snacks'],
    ['photo-1578916171728-46686eac8d58','Grocery and convenience aisles'],
    ['photo-1606787366850-de6330128bfc','Kitchen food assortment'],
    ['photo-1542838132-92c53300491e','Food retail shelves']
  ],
  home:[
    ['photo-1556909114-f6e7ad7d3136','Household and kitchen essentials'],
    ['photo-1604719312566-8912e9227c6a','Household store shelving'],
    ['photo-1578916171728-46686eac8d58','Neighborhood everyday necessities'],
    ['photo-1606787366850-de6330128bfc','Daily kitchen supplies']
  ]
});
export function getSampleStoreImages(type,offset=0,storeName='Sample store') {
  const list=PHOTO_GROUPS[type]||PHOTO_GROUPS.market;
  return Array.from({length:3},(_,index)=>{
    const [id,description]=list[(offset+index)%list.length];
    return {
      src:thumb(id),
      alt:`Representative photograph for ${storeName}: ${description}`,
      source:'https://unsplash.com',
      isRepresentative:true
    };
  });
}
