import { getSampleStoreImages } from './sampleStoreImages.js';

/**
 * Fictional demo store names for five Vizag zones.
 * 4 neighborhood listings per area, except MVP Colony: 3 samples plus
 * configured Sri Lakshmi Provisions. LocalFresh is visible in every zone.
 * No merchant here may accept real orders until verified onboarding.
 */
const demoGroups={
  "NAD Kotha Road": {
    "slug": "nad",
    "shops": [
      [
        "NAD Family Mart",
        "market",
        [
          "Household Staples",
          "Dairy & Breakfast",
          "Snacks & Munchies"
        ]
      ],
      [
        "Kotha Road Fresh Basket",
        "fresh",
        [
          "Fresh Produce",
          "Dairy & Breakfast",
          "Pulses & Grains"
        ]
      ],
      [
        "Junction Snack Stop",
        "snacks",
        [
          "Snacks & Munchies",
          "Cold Drinks & Juices",
          "Dairy & Breakfast"
        ]
      ],
      [
        "NAD Home & Daily",
        "home",
        [
          "Cleaning & Pooja",
          "Household Staples",
          "Personal Care"
        ]
      ]
    ]
  },
  "Dabagardens": {
    "slug": "daba",
    "shops": [
      [
        "Daba Bazaar Provisions",
        "market",
        [
          "Household Staples",
          "Pulses & Grains",
          "Dairy & Breakfast"
        ]
      ],
      [
        "Garden Gate Pantry",
        "fresh",
        [
          "Fresh Produce",
          "Snacks & Munchies",
          "Dairy & Breakfast"
        ]
      ],
      [
        "Daba Treats & Drinks",
        "snacks",
        [
          "Cold Drinks & Juices",
          "Snacks & Munchies",
          "Household Staples"
        ]
      ],
      [
        "City Centre Essentials",
        "home",
        [
          "Cleaning & Pooja",
          "Personal Care",
          "Household Staples"
        ]
      ]
    ]
  },
  "Siripuram": {
    "slug": "siri",
    "shops": [
      [
        "Siripuram Daily Basket",
        "market",
        [
          "Dairy & Breakfast",
          "Household Staples",
          "Pulses & Grains"
        ]
      ],
      [
        "Coastal Fresh Pantry",
        "fresh",
        [
          "Fresh Produce",
          "Dairy & Breakfast",
          "Oils & Ghee"
        ]
      ],
      [
        "Siripuram Snack Avenue",
        "snacks",
        [
          "Snacks & Munchies",
          "Cold Drinks & Juices",
          "Dairy & Breakfast"
        ]
      ],
      [
        "Harbour Home Supplies",
        "home",
        [
          "Personal Care",
          "Cleaning & Pooja",
          "Household Staples"
        ]
      ]
    ]
  },
  "MVP Colony": {
    "slug": "mvp",
    "shops": [
      [
        "MVP Corner Mart",
        "market",
        [
          "Household Staples",
          "Dairy & Breakfast",
          "Snacks & Munchies"
        ]
      ],
      [
        "Sector Fresh Basket",
        "fresh",
        [
          "Fresh Produce",
          "Dairy & Breakfast",
          "Pulses & Grains"
        ]
      ],
      [
        "MVP Home Needs",
        "home",
        [
          "Cleaning & Pooja",
          "Personal Care",
          "Household Staples"
        ]
      ]
    ]
  },
  "Gajuwaka": {
    "slug": "gaju",
    "shops": [
      [
        "Gajuwaka Family Stores",
        "market",
        [
          "Dairy & Breakfast",
          "Household Staples",
          "Pulses & Grains"
        ]
      ],
      [
        "Steel City Fresh Mart",
        "fresh",
        [
          "Fresh Produce",
          "Dairy & Breakfast",
          "Oils & Ghee"
        ]
      ],
      [
        "Gajuwaka Snack House",
        "snacks",
        [
          "Snacks & Munchies",
          "Cold Drinks & Juices",
          "Dairy & Breakfast"
        ]
      ],
      [
        "Steel City Home Mart",
        "home",
        [
          "Cleaning & Pooja",
          "Personal Care",
          "Household Staples"
        ]
      ]
    ]
  }
};
export const sampleAreaStores=Object.entries(demoGroups).flatMap(([area,group],areaIndex)=>
  group.shops.map(([name,photoType,categories],index)=>{
    const gallery=getSampleStoreImages(photoType,(areaIndex+index)%4,name);
    return {
      id:`sample-${group.slug}-${index+1}`,
      name,
      owner:'Demo listing — merchant registration pending',
      isSample:true,
      rating:null,
      reviewCount:0,
      deliveryTime:'Not accepting orders',
      deliveryFee:20+(index%3)*5,
      distance:null,
      minOrder:0,
      address:`${area}, Visakhapatnam (example location only)`,
      serviceAreas:[area],
      isOpen:true,
      isFeatured:false,
      offer:null,
      tags:['Sample storefront','Merchant registration pending'],
      image:'🏬',
      posterImage:gallery[0].src,
      gallery,
      posterBadge:'SAMPLE · NOT A VERIFIED MERCHANT',
      posterTagline:'Sample shop preview — merchant onboarding pending',
      categories
    };
  })
);
