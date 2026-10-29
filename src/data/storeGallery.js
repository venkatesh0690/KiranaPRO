/* Curated, non-overlapping representative photographs, one set per store.
   Unsplash images are editorial examples, not verified photographs of the specific retailers.
   Seller-provided real premises photos can replace these later. */
const galleries = {
  "1": [
    {
      "src": "https://unsplash.com/photos/rWMIbqmOxrY/download?force=true&w=960",
      "alt": "Grocery aisle with stocked shelves"
    },
    {
      "src": "https://unsplash.com/photos/IH65r4HEQWQ/download?force=true&w=960",
      "alt": "Rows of packaged food in store"
    },
    {
      "src": "https://unsplash.com/photos/ivfp_yxZuYQ/download?force=true&w=960",
      "alt": "Groceries, grains and dairy shelves"
    }
  ],
  "2": [
    {
      "src": "https://unsplash.com/photos/GZ0BQCskZRc/download?force=true&w=960",
      "alt": "Packaged pantry staples in shop"
    },
    {
      "src": "https://unsplash.com/photos/iDGTGktD97Q/download?force=true&w=960",
      "alt": "Shelves with provisions and daily essentials"
    },
    {
      "src": "https://unsplash.com/photos/o7pi47fEjNI/download?force=true&w=960",
      "alt": "Store shelf with packaged goods"
    }
  ],
  "3": [
    {
      "src": "https://unsplash.com/photos/aSEA8rcaz2w/download?force=true&w=960",
      "alt": "Convenience store shelves and beverages"
    },
    {
      "src": "https://unsplash.com/photos/WTOWyep_ErY/download?force=true&w=960",
      "alt": "Modern shelf displays and bottles"
    },
    {
      "src": "https://unsplash.com/photos/3v5yG5u8L0Y/download?force=true&w=960",
      "alt": "Grocery shelves and packaged food"
    }
  ],
  "4": [
    {
      "src": "https://unsplash.com/photos/2h1O8DtRu3g/download?force=true&w=960",
      "alt": "Fresh produce and grocery section"
    },
    {
      "src": "https://unsplash.com/photos/mBMl2OkGgAg/download?force=true&w=960",
      "alt": "Supermarket vegetables and snacks"
    },
    {
      "src": "https://unsplash.com/photos/oxTEjCULfwQ/download?force=true&w=960",
      "alt": "Produce and staple shelves"
    }
  ],
  "5": [
    {
      "src": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=960&q=78",
      "alt": "Well stocked store cupboards"
    },
    {
      "src": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=960&q=78",
      "alt": "Home and kitchen storage shelves"
    },
    {
      "src": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=960&q=78",
      "alt": "Departmental store grocery shelving"
    }
  ],
  "localfresh": [
    {
      "src": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=960&q=78",
      "alt": "Fresh vegetable market stands"
    },
    {
      "src": "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=960&q=78",
      "alt": "Freshly arranged vegetables and gourds"
    },
    {
      "src": "https://images.unsplash.com/photo-1659465856958-aaa0e5891796?auto=format&fit=crop&w=960&q=78",
      "alt": "Fruit and flower market display"
    }
  ]
};

export function getStoreGallery(store) {
  const key = String(store?.id ?? '').toLowerCase();
  return galleries[key] || [{ src: '/stores/sharma-general.svg', alt: 'Illustrative grocery shelves' }];
}
export function getStoreImageFallback(store) {
  const fallback = {
    localfresh:'/stores/localfresh.svg',
    '1':'/stores/sharma-general.svg',
    '2':'/stores/sri-lakshmi.svg',
    '3':'/stores/venkateswara.svg',
    '4':'/stores/ramaiah.svg',
    '5':'/stores/annapurna.svg'
  };
  return fallback[String(store?.id??'').toLowerCase()] || '/stores/sharma-general.svg';
}
