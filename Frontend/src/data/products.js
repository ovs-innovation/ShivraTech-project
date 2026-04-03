import rightHero from "../assets/rightHero.png";
import rightHero1 from "../assets/rightHero1.png";
import rightHero2 from "../assets/rightHero2.png";

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const categoryContent = {
  audio: {
    summary: "clear sound, reliable battery life, and immersive daily listening",
    highlights: [
      "Balanced sound tuning",
      "Long battery backup",
      "Comfort-first design",
      "Fast pairing support",
    ],
    specs: [
      ["Warranty", "1 year"],
      ["Delivery", "Same-day available"],
      ["Support", "Easy replacement"],
    ],
  },
  "mobile-accessories": {
    summary: "charging faster, protecting devices, and staying powered on the go",
    highlights: [
      "Fast charging support",
      "Travel-friendly build",
      "Compact daily carry",
      "Reliable protection",
    ],
    specs: [
      ["Warranty", "6 months"],
      ["Delivery", "City-wide dispatch"],
      ["Support", "Quick accessory help"],
    ],
  },
  "pc-accessories": {
    summary: "productive desk setups, cleaner workflow, and better device connectivity",
    highlights: [
      "Desk-ready finish",
      "Smooth device pairing",
      "Work and gaming use",
      "Plug-and-play setup",
    ],
    specs: [
      ["Warranty", "1 year"],
      ["Delivery", "Priority city shipping"],
      ["Support", "Setup guidance"],
    ],
  },
  "car-accessories": {
    summary: "safer drives, stronger mounting, and reliable in-car convenience",
    highlights: [
      "Road-tested grip",
      "Fast in-car power",
      "Travel-ready design",
      "Stable fit on long drives",
    ],
    specs: [
      ["Warranty", "1 year"],
      ["Delivery", "Fast dispatch"],
      ["Support", "Installation help"],
    ],
  },
  lifestyle: {
    summary: "smart everyday utility, wearable comfort, and active routines",
    highlights: [
      "Lightweight daily use",
      "Smart utility focus",
      "Travel and fitness ready",
      "Comfort-led design",
    ],
    specs: [
      ["Warranty", "1 year"],
      ["Delivery", "Same-day on select areas"],
      ["Support", "Lifestyle care help"],
    ],
  },
};

const rawProductSections = [
  {
    key: "audio",
    label: "Audio",
    title: "Top audio picks",
    viewAllLink: "/categories#audio",
    cards: [
      {
        title: "Wireless Audio Bundle with premium over-ear sound experience",
        price: "Rs. 33,900.00",
        mrp: "Rs. 34,900.00",
        off: "3% OFF",
        promo: "Rs. 2K instant discount",
        rating: 4,
        reviews: 105,
        img: rightHero,
        categorySlug: "audio",
        categoryName: "Audio",
      },
      {
        title: "Premium Sound Pod with compact build and room-filling output",
        price: "Rs. 17,999.00",
        mrp: "Rs. 19,999.00",
        off: "10% OFF",
        promo: "Bank offer available",
        rating: 4,
        reviews: 86,
        img: rightHero1,
        categorySlug: "audio",
        categoryName: "Audio",
      },
      {
        title: "Portable Bass Speaker with party-ready battery backup",
        price: "Rs. 14,499.00",
        mrp: "Rs. 17,499.00",
        off: "17% OFF",
        promo: "Weekend audio deal",
        rating: 5,
        reviews: 148,
        img: rightHero2,
        categorySlug: "audio",
        categoryName: "Audio",
      },
      {
        title: "Noise Shield Earbuds with all-day fit and clear calls",
        price: "Rs. 9,999.00",
        mrp: "Rs. 12,999.00",
        off: "23% OFF",
        promo: "Launch price",
        rating: 4,
        reviews: 171,
        img: rightHero,
        categorySlug: "audio",
        categoryName: "Audio",
      },
    ],
  },
  {
    key: "mobile-accessories",
    label: "Mobile Accessories",
    title: "Everyday power and protection",
    viewAllLink: "/categories#mobile-accessories",
    cards: [
      {
        title: "Fast Charge Travel Kit with 65W adapter and braided cable",
        price: "Rs. 4,999.00",
        mrp: "Rs. 6,499.00",
        off: "23% OFF",
        promo: "Charging combo offer",
        rating: 4,
        reviews: 129,
        img: rightHero1,
        categorySlug: "mobile-accessories",
        categoryName: "Mobile Accessories",
      },
      {
        title: "Magnetic Power Bank with slim pocket-friendly design",
        price: "Rs. 6,999.00",
        mrp: "Rs. 8,499.00",
        off: "18% OFF",
        promo: "Power backup deal",
        rating: 4,
        reviews: 117,
        img: rightHero2,
        categorySlug: "mobile-accessories",
        categoryName: "Mobile Accessories",
      },
      {
        title: "Protective Case Pack with stand grip and camera shield",
        price: "Rs. 2,499.00",
        mrp: "Rs. 3,199.00",
        off: "22% OFF",
        promo: "Best seller",
        rating: 4,
        reviews: 154,
        img: rightHero,
        categorySlug: "mobile-accessories",
        categoryName: "Mobile Accessories",
      },
      {
        title: "Dashboard Phone Mount with strong lock and 360 view",
        price: "Rs. 1,999.00",
        mrp: "Rs. 2,699.00",
        off: "26% OFF",
        promo: "Drive essentials",
        rating: 5,
        reviews: 142,
        img: rightHero1,
        categorySlug: "mobile-accessories",
        categoryName: "Mobile Accessories",
      },
    ],
  },
  {
    key: "pc-accessories",
    label: "PC Accessories",
    title: "Desk and productivity gear",
    viewAllLink: "/categories#pc-accessories",
    cards: [
      {
        title: "Creative Desk Essentials for work, streaming and daily setup",
        price: "Rs. 29,999.00",
        mrp: "Rs. 36,999.00",
        off: "19% OFF",
        promo: "Special exchange offer",
        rating: 5,
        reviews: 118,
        img: rightHero2,
        categorySlug: "pc-accessories",
        categoryName: "PC Accessories",
      },
      {
        title: "Mechanical Keyboard Pro with tactile feel and RGB glow",
        price: "Rs. 8,999.00",
        mrp: "Rs. 10,999.00",
        off: "18% OFF",
        promo: "Desk setup deal",
        rating: 4,
        reviews: 132,
        img: rightHero,
        categorySlug: "pc-accessories",
        categoryName: "PC Accessories",
      },
      {
        title: "Wireless Productivity Mouse with silent clicks and precision",
        price: "Rs. 3,499.00",
        mrp: "Rs. 4,299.00",
        off: "19% OFF",
        promo: "Office pick",
        rating: 4,
        reviews: 96,
        img: rightHero1,
        categorySlug: "pc-accessories",
        categoryName: "PC Accessories",
      },
      {
        title: "Multiport USB-C Hub with HDMI, LAN and card reader support",
        price: "Rs. 5,499.00",
        mrp: "Rs. 6,999.00",
        off: "21% OFF",
        promo: "Creator choice",
        rating: 5,
        reviews: 111,
        img: rightHero2,
        categorySlug: "pc-accessories",
        categoryName: "PC Accessories",
      },
    ],
  },
  {
    key: "car-accessories",
    label: "Car Accessories",
    title: "Drive-ready essentials",
    viewAllLink: "/categories#car-accessories",
    cards: [
      {
        title: "Smart Drive Media Kit with dashboard-ready setup",
        price: "Rs. 21,999.00",
        mrp: "Rs. 24,000.00",
        off: "8% OFF",
        promo: "7.5% OFF or 6 month EMI",
        rating: 4,
        reviews: 92,
        img: rightHero1,
        categorySlug: "car-accessories",
        categoryName: "Car Accessories",
      },
      {
        title: "Dual Port Car Charger with metal body and fast output",
        price: "Rs. 2,299.00",
        mrp: "Rs. 2,999.00",
        off: "23% OFF",
        promo: "Drive power offer",
        rating: 4,
        reviews: 123,
        img: rightHero,
        categorySlug: "car-accessories",
        categoryName: "Car Accessories",
      },
      {
        title: "Road Trip Mount Pack with vent clip and windshield arm",
        price: "Rs. 3,499.00",
        mrp: "Rs. 4,299.00",
        off: "19% OFF",
        promo: "Travel ready",
        rating: 5,
        reviews: 89,
        img: rightHero2,
        categorySlug: "car-accessories",
        categoryName: "Car Accessories",
      },
      {
        title: "Bluetooth Car Audio Receiver with low-latency streaming",
        price: "Rs. 4,799.00",
        mrp: "Rs. 5,699.00",
        off: "16% OFF",
        promo: "In-car audio deal",
        rating: 4,
        reviews: 109,
        img: rightHero1,
        categorySlug: "car-accessories",
        categoryName: "Car Accessories",
      },
    ],
  },
  {
    key: "lifestyle",
    label: "Lifestyle",
    title: "Smart daily lifestyle",
    viewAllLink: "/categories#lifestyle",
    cards: [
      {
        title: "Daily Wear Smart Set with sleek finish for everyday styling",
        price: "Rs. 19,999.00",
        mrp: "Rs. 21,999.00",
        off: "9% OFF",
        promo: "7.5% instant card discount",
        rating: 4,
        reviews: 101,
        img: rightHero2,
        categorySlug: "lifestyle",
        categoryName: "Lifestyle",
      },
      {
        title: "Compact Audio Companion for portable listening and travel use",
        price: "Rs. 28,999.00",
        mrp: "Rs. 34,999.00",
        off: "17% OFF",
        promo: "Easy EMI available",
        rating: 4,
        reviews: 79,
        img: rightHero,
        categorySlug: "lifestyle",
        categoryName: "Lifestyle",
      },
      {
        title: "Travel Dash Access Pack with premium fit and versatile utility",
        price: "Rs. 24,499.00",
        mrp: "Rs. 29,999.00",
        off: "18% OFF",
        promo: "Seller special price",
        rating: 5,
        reviews: 133,
        img: rightHero1,
        categorySlug: "lifestyle",
        categoryName: "Lifestyle",
      },
      {
        title: "Signature Style Combo with clean minimal look and smart finish",
        price: "Rs. 18,499.00",
        mrp: "Rs. 22,499.00",
        off: "17% OFF",
        promo: "Limited period offer",
        rating: 4,
        reviews: 94,
        img: rightHero2,
        categorySlug: "lifestyle",
        categoryName: "Lifestyle",
      },
    ],
  },
];

const enrichProduct = (card, section) => {
  const content = categoryContent[card.categorySlug] ?? {
    summary: "smart everyday shopping",
    highlights: ["Trusted offer", "Quick delivery", "Quality-first build"],
    specs: [
      ["Warranty", "1 year"],
      ["Delivery", "Fast shipping"],
      ["Support", "Easy support"],
    ],
  };

  return {
    ...card,
    slug: slugify(card.title),
    shortDescription: `${card.title} is part of ShivraTech's ${card.categoryName.toLowerCase()} collection, built for ${content.summary}.`,
    highlights: content.highlights,
    specs: [
      ["Category", card.categoryName],
      ["Offer", card.off],
      ["Deal", card.promo],
      ...content.specs,
    ],
    searchText: [
      card.title,
      card.categoryName,
      card.categorySlug,
      card.promo,
      section.label,
      section.title,
      content.summary,
    ]
      .join(" ")
      .toLowerCase(),
  };
};

export const productSections = rawProductSections.map((section) => ({
  ...section,
  cards: section.cards.map((card) => enrichProduct(card, section)),
}));

export const allProducts = productSections.flatMap((section) =>
  section.cards.map((card, index) => ({
    ...card,
    key: `${section.key}-${index}`,
    sectionKey: section.key,
    sectionTitle: section.title,
  })),
);

export const parsePrice = (price) =>
  Number(price.replace(/[^0-9.]/g, "")) || 0;

export const formatPrice = (value) =>
  `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const findProductBySlug = (slug) =>
  allProducts.find((product) => product.slug === slug);

export const searchProducts = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return allProducts;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return allProducts.filter((product) =>
    terms.every((term) => product.searchText.includes(term)),
  );
};
