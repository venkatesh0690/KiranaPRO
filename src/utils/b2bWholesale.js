// B2B Wholesale Mode, Commercial Slots & Tax Invoice Formatter
// Playbook Phase 26

export const B2B_SLOTS = [
  { id: 'b2b-dawn', label: '5:30 AM – 7:00 AM (Pre-Service Dawn Drop)', desc: 'Ideal for Idli/Dosa Tiffin Centers & Messes' },
  { id: 'b2b-morning', label: '7:00 AM – 8:30 AM (Commercial Morning Drop)', desc: 'For Hostels & Catering Units' }
];

export const B2B_BULK_ITEMS = [
  {
    id: 'b2b-onion-sack-25',
    name: 'Farm Fresh Onions (25 kg Commercial Sack)',
    category: 'Vegetables',
    unit: '25 kg sack',
    minQty: 1,
    mrp: 900,
    b2bPrice: 650,
    savings: 250,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2b-potato-sack-25',
    name: 'Graded Table Potatoes (25 kg Commercial Sack)',
    category: 'Vegetables',
    unit: '25 kg sack',
    minQty: 1,
    mrp: 750,
    b2bPrice: 525,
    savings: 225,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2b-tomato-crate-20',
    name: 'Firm Salad/Curry Tomatoes (20 kg Mandi Crate)',
    category: 'Vegetables',
    unit: '20 kg crate',
    minQty: 1,
    mrp: 640,
    b2bPrice: 440,
    savings: 200,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2b-oil-tin-15l',
    name: 'Refined Sunflower Oil (15 Litre Commercial Tin)',
    category: 'Groceries',
    unit: '15 L tin',
    minQty: 1,
    mrp: 1950,
    b2bPrice: 1680,
    savings: 270,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2b-toor-dal-10kg',
    name: 'Premium Fatka Toor Dal (10 kg Bulk Bag)',
    category: 'Groceries',
    unit: '10 kg bag',
    minQty: 1,
    mrp: 1750,
    b2bPrice: 1420,
    savings: 330,
    image: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ee?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'b2b-green-chilli-5kg',
    name: 'Spicy Guntur Green Chillies (5 kg Wholesale Bag)',
    category: 'Vegetables',
    unit: '5 kg bag',
    minQty: 1,
    mrp: 350,
    b2bPrice: 240,
    savings: 110,
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&auto=format&fit=crop&q=80'
  }
];

export function formatInvoiceData({ order, customer, store }) {
  const items = order?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST estimate
  const delivery = order?.deliveryFee !== undefined ? order.deliveryFee : 2;
  const handling = 5;
  const discount = order?.discount || 0;
  const total = Math.max(0, subtotal + gst + delivery + handling - discount);

  return {
    invoiceNumber: `INV-${order?.id || 'KP-1001'}`,
    date: new Date(order?.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    businessName: 'KiranaPRO Hyperlocal Technologies Pvt Ltd',
    gstin: '37AAAAK9281M1Z5',
    area: order?.storeArea || 'Siripuram, Visakhapatnam',
    customerName: customer?.name || 'Valued Neighbor',
    customerPhone: customer?.phone || '+91 98480 22338',
    deliveryAddress: order?.deliveryAddress || 'Visakhapatnam, Andhra Pradesh',
    items,
    subtotal,
    gst,
    delivery,
    handling,
    discount,
    total,
    paymentMethod: order?.paymentMethod || 'Cash on Delivery (COD)',
    deliveryPin: order?.deliveryPin || '4821',
    status: order?.status || 'DELIVERED_COD_COLLECTED'
  };
}
