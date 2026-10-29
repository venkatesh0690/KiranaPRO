/**
 * Sample local storefronts to demonstrate area-based discovery.
 * These records are NOT real registered retailers or verified opening hours.
 * Replace them through real merchant onboarding before allowing orders.
 * Four stores per area; MVP Colony has an existing configured retailer, so
 * that area needs only three sample listings.
 */
const demoGroups = {
  'NAD Kotha Road': {
    slug:'nad',
    shops:[
      ['Daily Groceries',['Household Staples','Dairy & Breakfast','Snacks & Munchies']],
      ['Fresh & Pantry',['Fresh Produce','Dairy & Breakfast','Pulses & Grains']],
      ['Snack Corner',['Snacks & Munchies','Cold Drinks & Juices','Dairy & Breakfast']],
      ['Home Essentials',['Cleaning & Pooja','Household Staples','Personal Care']]
    ]
  },
  'Dabagardens': {
    slug:'daba',
    shops:[
      ['Daily Groceries',['Household Staples','Pulses & Grains','Dairy & Breakfast']],
      ['Fresh & Pantry',['Fresh Produce','Snacks & Munchies','Dairy & Breakfast']],
      ['Snack Corner',['Cold Drinks & Juices','Snacks & Munchies','Household Staples']],
      ['Home Essentials',['Cleaning & Pooja','Personal Care','Household Staples']]
    ]
  },
  'Siripuram': {
    slug:'siri',
    shops:[
      ['Daily Groceries',['Dairy & Breakfast','Household Staples','Pulses & Grains']],
      ['Fresh & Pantry',['Fresh Produce','Dairy & Breakfast','Oils & Ghee']],
      ['Snack Corner',['Snacks & Munchies','Cold Drinks & Juices','Dairy & Breakfast']],
      ['Home Essentials',['Personal Care','Cleaning & Pooja','Household Staples']]
    ]
  },
  'MVP Colony': {
    slug:'mvp',
    shops:[
      ['Daily Groceries',['Household Staples','Dairy & Breakfast','Snacks & Munchies']],
      ['Fresh & Pantry',['Fresh Produce','Dairy & Breakfast','Pulses & Grains']],
      ['Home Essentials',['Cleaning & Pooja','Personal Care','Household Staples']]
    ]
  },
  'Gajuwaka': {
    slug:'gaju',
    shops:[
      ['Daily Groceries',['Dairy & Breakfast','Household Staples','Pulses & Grains']],
      ['Fresh & Pantry',['Fresh Produce','Dairy & Breakfast','Oils & Ghee']],
      ['Snack Corner',['Snacks & Munchies','Cold Drinks & Juices','Dairy & Breakfast']],
      ['Home Essentials',['Cleaning & Pooja','Personal Care','Household Staples']]
    ]
  }
};

export const sampleAreaStores = Object.entries(demoGroups).flatMap(([area,group]) =>
  group.shops.map(([label,categories],index) => ({
    id:`sample-${group.slug}-${index+1}`,
    name:`${label} · ${area} (Sample)`,
    owner:'Demo listing — merchant registration pending',
    isSample:true,
    rating:null,
    reviewCount:0,
    deliveryTime:'Not accepting orders yet',
    deliveryFee:20 + (index%3)*5,
    distance:null,
    minOrder:0,
    address:`${area}, Visakhapatnam`,
    serviceAreas:[area],
    isOpen:true,
    isFeatured:false,
    offer:null,
    tags:['Sample store','Merchant registration pending'],
    image:['🛒','🥬','🍪','🧴'][index],
    posterImage:null,
    posterTagline:'Preview listing — store details to be confirmed',
    categories
  }))
);
