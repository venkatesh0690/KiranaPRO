// Editorial representative photography for store discovery.
// These are illustrative Unsplash photos, not verified images of the listed shops.
// Only this module controls the gallery. Replacing pictures later is straightforward.
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=960&q=75`;

const galleries = {
  localfresh: [
    { src: image('photo-1542838132-92c53300491e'), alt: 'Fresh produce market display' },
    { src: image('photo-1590779033100-9f60a05a013d'), alt: 'Seasonal vegetables at the market' },
    { src: image('photo-1447175008436-054170c2e979'), alt: 'Fresh vegetables and greens' }
  ],
  '1': [
    { src: image('photo-1578916171728-46686eac8d58'), alt: 'Grocery shop shelves and displays' },
    { src: image('photo-1604719312566-8912e9227c6a'), alt: 'Stocked daily essentials shelves' },
    { src: image('photo-1606787366850-de6330128bfc'), alt: 'Food and provisions display' }
  ],
  '2': [
    { src: image('photo-1606787366850-de6330128bfc'), alt: 'Store provisions and pantry goods' },
    { src: image('photo-1578916171728-46686eac8d58'), alt: 'Grocery cabinets and stocked shelves' },
    { src: image('photo-1556909114-f6e7ad7d3136'), alt: 'Kitchen provisions and storage' }
  ],
  '3': [
    { src: image('photo-1604719312566-8912e9227c6a'), alt: 'Colorful grocery shelves' },
    { src: image('photo-1578916171728-46686eac8d58'), alt: 'Neighborhood shop products' },
    { src: image('photo-1542838132-92c53300491e'), alt: 'Fresh food section' }
  ],
  '4': [
    { src: image('photo-1578916171728-46686eac8d58'), alt: 'Supermarket aisle and shelves' },
    { src: image('photo-1542838132-92c53300491e'), alt: 'Fresh produce and groceries' },
    { src: image('photo-1604719312566-8912e9227c6a'), alt: 'Full grocery store shelves' }
  ],
  '5': [
    { src: image('photo-1604719312566-8912e9227c6a'), alt: 'Household essentials in store' },
    { src: image('photo-1578916171728-46686eac8d58'), alt: 'Provisions on store cupboards' },
    { src: image('photo-1556909114-f6e7ad7d3136'), alt: 'Household and kitchen storage' }
  ]
};

export function getStoreGallery(store) {
  const key = String(store?.id ?? '').toLowerCase();
  const list = galleries[key];
  if (list?.length) return list;
  // Future seller-created stores: neutral photo and existing image fallback.
  return [{ src: image('photo-1578916171728-46686eac8d58'), alt: 'Grocery store interior' }];
}

export function getStoreImageFallback(store) {
  const staticPaths = {
    localfresh: '/stores/localfresh.svg',
    '1': '/stores/sharma-general.svg',
    '2': '/stores/sri-lakshmi.svg',
    '3': '/stores/venkateswara.svg',
    '4': '/stores/ramaiah.svg',
    '5': '/stores/annapurna.svg'
  };
  return staticPaths[String(store?.id ?? '').toLowerCase()] || '/stores/sharma-general.svg';
}
