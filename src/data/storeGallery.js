/* Real photographs sourced from Unsplash free-use photo pages.
 * These are representative market/store scenes, not verified photos of named shops.
 * See STORE_PHOTO_CREDITS.md for image pages and photographer attribution.
 * No generated storefront art or GIF imagery is used.
 */
const galleries = {
  "1": [
    {
      "src": "https://unsplash.com/photos/bAKYjjvAQIE/download?force=true&w=960",
      "alt": "Representative real photograph: Indian kirana shop with daily essentials",
      "author": "Zoshua Colah",
      "source": "https://unsplash.com/photos/bAKYjjvAQIE"
    },
    {
      "src": "https://unsplash.com/photos/HJ8Pptkz0Gk/download?force=true&w=960",
      "alt": "Representative real photograph: Grocery packets on shelves at a Delhi shop",
      "author": "Ravi Sharma",
      "source": "https://unsplash.com/photos/HJ8Pptkz0Gk"
    },
    {
      "src": "https://unsplash.com/photos/rWMIbqmOxrY/download?force=true&w=960",
      "alt": "Representative real photograph: Groceries on retail shelves",
      "author": "Nathália Rosa",
      "source": "https://unsplash.com/photos/rWMIbqmOxrY"
    }
  ],
  "2": [
    {
      "src": "https://unsplash.com/photos/Gwf6GRmkT1Y/download?force=true&w=960",
      "alt": "Representative real photograph: Indian spice and dry-goods shop",
      "author": "Colin White",
      "source": "https://unsplash.com/photos/Gwf6GRmkT1Y"
    },
    {
      "src": "https://unsplash.com/photos/aIcw-jdp53s/download?force=true&w=960",
      "alt": "Representative real photograph: Indian masala spices in glass jars",
      "author": "Unsplash contributor",
      "source": "https://unsplash.com/photos/aIcw-jdp53s"
    },
    {
      "src": "https://unsplash.com/photos/PDBnKupmi7E/download?force=true&w=960",
      "alt": "Representative real photograph: Masala jars on shop shelves",
      "author": "Unsplash contributor",
      "source": "https://unsplash.com/photos/PDBnKupmi7E"
    }
  ],
  "3": [
    {
      "src": "https://unsplash.com/photos/7H-CWW3rz9U/download?force=true&w=960",
      "alt": "Representative real photograph: Indian shop snack shelves",
      "author": "Zoshua Colah",
      "source": "https://unsplash.com/photos/7H-CWW3rz9U"
    },
    {
      "src": "https://unsplash.com/photos/aSEA8rcaz2w/download?force=true&w=960",
      "alt": "Representative real photograph: Convenience store shelves and beverages",
      "author": "Sobolev Maksim",
      "source": "https://unsplash.com/photos/aSEA8rcaz2w"
    },
    {
      "src": "https://unsplash.com/photos/DOycDWzx-dQ/download?force=true&w=960",
      "alt": "Representative real photograph: Local convenience store shelving",
      "author": "Bruno BD",
      "source": "https://unsplash.com/photos/DOycDWzx-dQ"
    }
  ],
  "4": [
    {
      "src": "https://unsplash.com/photos/FAziP8fKUNg/download?force=true&w=600&h=370&q=54&fm=webp",
      "alt": "Representative real photograph: Aisle of packaged rice and beans",
      "author": "Bernd Dittrich",
      "source": "https://unsplash.com/photos/FAziP8fKUNg"
    },
    {
      "src": "https://unsplash.com/photos/3VoUDb-sVt4/download?force=true&w=600&h=370&q=54&fm=webp",
      "alt": "Representative real photograph: Shelves of packaged snacks and groceries",
      "author": "Adiptalk",
      "source": "https://unsplash.com/photos/3VoUDb-sVt4"
    },
    {
      "src": "https://unsplash.com/photos/ku-iy4fOVIQ/download?force=true&w=600&h=370&q=54&fm=webp",
      "alt": "Representative real photograph: Packaged foods and beverage shelves",
      "author": "Adiptalk",
      "source": "https://unsplash.com/photos/ku-iy4fOVIQ"
    }
  ],
  "5": [
    {
      "src": "https://unsplash.com/photos/48gk2I7mRs8/download?force=true&w=960",
      "alt": "Representative real photograph: Household cleaning products in shop",
      "author": "Franki Chamaki",
      "source": "https://unsplash.com/photos/48gk2I7mRs8"
    },
    {
      "src": "https://unsplash.com/photos/Jj8-Q0kekCo/download?force=true&w=960",
      "alt": "Representative real photograph: Detergent bottles on retail shelves",
      "author": "Adhitya Sibikumar",
      "source": "https://unsplash.com/photos/Jj8-Q0kekCo"
    },
    {
      "src": "https://unsplash.com/photos/3v5yG5u8L0Y/download?force=true&w=960",
      "alt": "Representative real photograph: Household groceries in department store",
      "author": "Brad",
      "source": "https://unsplash.com/photos/3v5yG5u8L0Y"
    }
  ],
  "localfresh": [
    {
      "src": "https://unsplash.com/photos/wguVC8oG3qw/download?force=true&w=960",
      "alt": "Representative real photograph: Vegetable baskets at Indian mandi",
      "author": "Harshal More",
      "source": "https://unsplash.com/photos/wguVC8oG3qw"
    },
    {
      "src": "https://unsplash.com/photos/9KTwGdcwbp4/download?force=true&w=960",
      "alt": "Representative real photograph: Indian street vegetable market",
      "author": "Unsplash contributor",
      "source": "https://unsplash.com/photos/9KTwGdcwbp4"
    },
    {
      "src": "https://unsplash.com/photos/Jo0usTWfuSQ/download?force=true&w=960",
      "alt": "Representative real photograph: Beans and eggplants at market",
      "author": "iKshana Productions",
      "source": "https://unsplash.com/photos/Jo0usTWfuSQ"
    }
  ]
};
const fallback = {
  localfresh: 'https://cdn.cosmos.so/ae599ae2-8581-4d39-9446-cb9c36b2a5aa?format=webp',
  '1': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=960&q=75',
  '2': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=960&q=75',
  '3': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=960&q=75',
  '4': 'https://unsplash.com/photos/FAziP8fKUNg/download?force=true&w=600&h=370&q=54&fm=webp',
  '5': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=960&q=75'
};
export function getStoreGallery(store) {
  const key=String(store?.id??'').toLowerCase();
  if(Array.isArray(store?.gallery) && store.gallery.length) return store.gallery;
  if(galleries[key]) return galleries[key];
  return typeof store?.posterImage==='string' && /^https:\/\//.test(store.posterImage)
    ? [{src:store.posterImage,alt:'Store-provided photo'}] : [];
}
export function getStoreImageFallback(store) {
  return fallback[String(store?.id??'').toLowerCase()] || null;
}
