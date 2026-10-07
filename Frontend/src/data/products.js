import rightHero from "../assets/rightHero.png";
import rightHero1 from "../assets/rightHero1.png";
import rightHero2 from "../assets/rightHero2.png";
import categoryLaptop from "../assets/categoryLaptop.jpg";
import categoryMouse from "../assets/categoryMouse.jpg";
import categoryMonitor from "../assets/categoryMonitor.jpg";
import categoryPhone from "../assets/categoryPhone.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";
import heroCenterHeadphone from "../assets/heroCenterHeadphone.png";
import floatingEarbudsCard from "../assets/floatingEarbudsCard.jpg";

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

export const showcaseItems = [
  {
    slug: "asus-zenbook-14-oled",
    title: "Asus Zenbook 14 OLED Core Ultra 7",
    price: "Rs. 65,200",
    mrp: "Rs. 70,200",
    spec: "16/512GB",
    rating: 4.8,
    reviews: 142,
    img: categoryLaptop,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Asus Zenbook 14 OLED is engineered for premium mobile productivity and vivid entertainment.",
    highlights: ["OLED 120Hz display", "Core Ultra 7 AI processor", "All-day battery", "Sleek aluminum chassis"],
    specs: [["Processor", "Core Ultra 7"], ["RAM", "16GB LPDDR5X"], ["Storage", "512GB NVMe SSD"], ["Display", "14-inch 2.8K OLED"]],
    searchText: "asus zenbook 14 oled core ultra 7 laptop pc accessories",
  },
  {
    slug: "macbook-air-m3",
    title: "Ultra Slim Book 14 IPS Quad HD 16GB",
    price: "Rs. 58,999",
    mrp: "Rs. 64,500",
    spec: "16/512GB",
    rating: 4.9,
    reviews: 198,
    img: categoryLaptop,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Ultra Slim Book 14 offers unmatched efficiency and quiet fanless everyday speed.",
    highlights: ["Quad HD Retina display", "18-hour battery life", "Instant wake & Touch ID", "Precision glass trackpad"],
    specs: [["Processor", "Octa-Core Pro"], ["Memory", "16GB Unified"], ["Storage", "512GB SSD"], ["Weight", "1.24 kg"]],
    searchText: "ultra slim book 14 ips quad hd 16gb macbook laptop pc accessories",
  },
  {
    slug: "hp-spectre-pro",
    title: "Creator Studio Pro 15.6 FHD Ryzen 7",
    price: "Rs. 62,400",
    mrp: "Rs. 68,000",
    spec: "16/1TB",
    rating: 4.7,
    reviews: 95,
    img: categoryLaptop,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Creator Studio Pro delivers multi-core rendering muscle for video editing and multitasking.",
    highlights: ["Ryzen 7 8-core CPU", "1TB High-speed NVMe", "Anti-glare FHD IPS panel", "Fast USB-C charging"],
    specs: [["Processor", "AMD Ryzen 7"], ["RAM", "16GB DDR5"], ["Storage", "1TB SSD"], ["Display", "15.6 inch FHD 100% sRGB"]],
    searchText: "creator studio pro 15.6 fhd ryzen 7 laptop pc accessories",
  },
  {
    slug: "wireless-ergonomic-mouse",
    title: "Titanium Precision Wireless Ergonomic Mouse",
    price: "Rs. 3,499",
    mrp: "Rs. 4,299",
    spec: "4000 DPI",
    rating: 4.8,
    reviews: 164,
    img: categoryMouse,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Titanium Precision Wireless Ergonomic Mouse reduces wrist strain during prolonged desk work.",
    highlights: ["4000 DPI Optical Sensor", "Silent click switches", "Multi-device Bluetooth", "Rechargeable via USB-C"],
    specs: [["Sensor", "High-precision Optical"], ["DPI", "Up to 4000 DPI"], ["Connectivity", "2.4GHz + BT 5.2"], ["Battery", "Up to 70 days"]],
    searchText: "titanium precision wireless ergonomic mouse pc accessories",
  },
  {
    slug: "curved-gaming-monitor",
    title: "27-inch Frameless Ultra-Wide 165Hz IPS Monitor",
    price: "Rs. 24,900",
    mrp: "Rs. 29,999",
    spec: "165Hz 1ms",
    rating: 4.8,
    reviews: 112,
    img: categoryMonitor,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Immerse yourself in fluid gameplay and crystal clear workspace graphics with 165Hz IPS visuals.",
    highlights: ["165Hz Refresh Rate", "1ms Response Time", "Frameless 3-side border", "HDR400 certification"],
    specs: [["Panel", "27-inch Fast IPS"], ["Resolution", "2560 x 1440 QHD"], ["Ports", "2x HDMI 2.1, 1x DP 1.4"], ["Sync", "FreeSync & G-Sync Compatible"]],
    searchText: "27-inch frameless ultra-wide 165hz ips monitor curved gaming pc accessories",
  },
  {
    slug: "wireless-studio-headphones",
    title: "Shivra Aura Studio Wireless ANC Headphones",
    price: "Rs. 18,999",
    mrp: "Rs. 22,999",
    spec: "Hi-Res ANC",
    rating: 4.9,
    reviews: 245,
    img: heroCenterHeadphone,
    categorySlug: "audio",
    categoryName: "Audio",
    shortDescription: "Shivra Aura Studio Headphones combine hybrid active noise cancellation with studio acoustics.",
    highlights: ["Hybrid ANC up to 40dB", "40mm custom bio-cellulose drivers", "55-hour battery life", "Multipoint connection"],
    specs: [["Driver Size", "40mm Bio-cellulose"], ["Bluetooth", "v5.3 with LDAC"], ["Battery", "55 Hours (ANC off)"], ["Charging", "10 min for 5 hours"]],
    searchText: "shivra aura studio wireless anc headphones audio",
  },
  {
    slug: "pro-audio-headset",
    title: "Deep Bass Bluetooth Headset with Spatial Mic",
    price: "Rs. 12,499",
    mrp: "Rs. 15,999",
    spec: "40h Play",
    rating: 4.8,
    reviews: 188,
    img: rightHero,
    categorySlug: "audio",
    categoryName: "Audio",
    shortDescription: "Experience punchy deep bass and crystal clear call capture with AI spatial microphone array.",
    highlights: ["Dynamic bass boost", "Dual ENC beamforming mics", "Ultra-soft memory foam pads", "Low latency gaming mode"],
    specs: [["Battery", "40 Hours"], ["Latency", "45ms Game Mode"], ["Weight", "220g"], ["Warranty", "1 Year"]],
    searchText: "deep bass bluetooth headset with spatial mic audio",
  },
  {
    slug: "smart-watch-titanium",
    title: "Aura Smart Watch Pro AMOLED with Heart Track",
    price: "Rs. 14,999",
    mrp: "Rs. 17,999",
    spec: "AMOLED GPS",
    rating: 4.8,
    reviews: 176,
    img: categoryWatch,
    categorySlug: "lifestyle",
    categoryName: "Lifestyle",
    shortDescription: "Aura Smart Watch Pro tracks continuous health, heart rate, GPS activity, and notifications.",
    highlights: ["1.43-inch Always-on AMOLED", "Built-in Dual-band GPS", "SpO2 & continuous heart tracking", "5ATM water resistant"],
    specs: [["Display", "1.43\" AMOLED 466x466"], ["Battery", "12 Days typical"], ["Case", "Titanium alloy bezel"], ["Sensors", "PPG, SpO2, Barometer, Gyro"]],
    searchText: "aura smart watch pro amoled with heart track lifestyle",
  },
  {
    slug: "flagship-smartphone-pro",
    title: "Titanium Pro 5G Flagship Dual SIM 256GB",
    price: "Rs. 79,900",
    mrp: "Rs. 89,900",
    spec: "256GB 5G",
    rating: 4.9,
    reviews: 320,
    img: categoryPhone,
    categorySlug: "mobile-accessories",
    categoryName: "Mobile Accessories",
    shortDescription: "Flagship 5G smartphone packed with pro grade optical cameras and titanium frame resilience.",
    highlights: ["Snapdragon 8 Gen 3", "200MP OIS Quad camera", "6.78-inch 120Hz LTPO display", "100W HyperCharge"],
    specs: [["Processor", "Snapdragon 8 Gen 3"], ["Display", "6.78\" 120Hz LTPO AMOLED"], ["Storage", "256GB UFS 4.0"], ["Battery", "5400mAh with 100W wired"]],
    searchText: "titanium pro 5g flagship dual sim 256gb mobile phone",
  },
  {
    slug: "precision-rgb-mouse",
    title: "Optical Speed Sensor Gaming Mouse Silent Clicks",
    price: "Rs. 2,999",
    mrp: "Rs. 3,799",
    spec: "Silent Click",
    rating: 4.7,
    reviews: 130,
    img: categoryMouse,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Swift tracking, zero click noise, and customizable RGB accents make this mouse a desk staple.",
    highlights: ["Silent micro-switches", "RGB underglow lighting", "Teflon glide feet", "Braided paracord cable"],
    specs: [["DPI", "6400 DPI"], ["Weight", "68g Ultralight"], ["Switches", "20M Silent Click"], ["Cable", "1.8m Paracord"]],
    searchText: "optical speed sensor gaming mouse silent clicks pc accessories",
  },
  {
    slug: "aura-pods-anc",
    title: "Aura Pods ANC Pro with Smart Case Display",
    price: "Rs. 9,999",
    mrp: "Rs. 12,999",
    spec: "ANC 32dB",
    rating: 4.9,
    reviews: 210,
    img: floatingEarbudsCard,
    categorySlug: "audio",
    categoryName: "Audio",
    shortDescription: "Next-gen earbuds with interactive touch screen charging case and high fidelity audio.",
    highlights: ["Touchscreen Smart Case", "32dB Hybrid ANC", "Spatial 360 Audio", "32-hour combined playtime"],
    specs: [["ANC", "32dB"], ["Playtime", "8h + 24h case"], ["Bluetooth", "v5.3"], ["Water Resistance", "IPX5"]],
    searchText: "aura pods anc pro with smart case display audio",
  },
  {
    slug: "fast-charge-car-kit",
    title: "Smart Drive Media Kit & Magnetic Car Power",
    price: "Rs. 21,999",
    mrp: "Rs. 24,000",
    spec: "65W Fast",
    rating: 4.8,
    reviews: 84,
    img: rightHero1,
    categorySlug: "car-accessories",
    categoryName: "Car Accessories",
    shortDescription: "All-in-one car mount, 65W rapid magnetic charging, and hands-free FM/Bluetooth streamer.",
    highlights: ["65W Dual Output", "Auto-clamping magnetic mount", "FM Transmitter & Hands-free mic", "Overheat protection"],
    specs: [["Power", "65W (PD 45W + QC 20W)"], ["Mount Type", "Air vent / Dashboard"], ["Compatibility", "Universal Qi & MagSafe"]],
    searchText: "smart drive media kit magnetic car power car accessories",
  },
  {
    slug: "desk-setup-bundle",
    title: "Mechanical Pro Keypad & Creator Desk Hub",
    price: "Rs. 18,499",
    mrp: "Rs. 22,499",
    spec: "Multi-Hub",
    rating: 4.8,
    reviews: 92,
    img: rightHero2,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    shortDescription: "Custom hot-swappable tactile numpad combined with a 9-in-1 desktop connectivity hub.",
    highlights: ["Gateron Yellow switches", "4K 60Hz HDMI + 100W PD pass-through", "CNC Anodized aluminum frame", "Rotary volume knob"],
    specs: [["Hub Ports", "9 Ports"], ["Keys", "21 Keys + Knob"], ["Connection", "Detachable Type-C"], ["Backlight", "Per-key RGB"]],
    searchText: "mechanical pro keypad creator desk hub pc accessories",
  },
  {
    slug: "smart-audio-pod",
    title: "Compact Room Sound Pod 360 Party Bass",
    price: "Rs. 17,999",
    mrp: "Rs. 19,999",
    spec: "360 Audio",
    rating: 4.7,
    reviews: 115,
    img: rightHero1,
    categorySlug: "audio",
    categoryName: "Audio",
    shortDescription: "Fills bedrooms and living spaces with expansive 360-degree acoustic fidelity.",
    highlights: ["Omnidirectional Sound", "Stereo pairing capable", "16-hour rechargeable battery", "Water resistant IPX6"],
    specs: [["Power", "30W RMS"], ["Battery", "16 Hours"], ["Wireless", "Bluetooth 5.3 + AUX"], ["Weight", "850g"]],
    searchText: "compact room sound pod 360 party bass audio",
  },
  {
    slug: "travel-smart-watch-bundle",
    title: "Endurance Lifestyle Watch with Braided Straps",
    price: "Rs. 19,999",
    mrp: "Rs. 21,999",
    spec: "7-Day Bat",
    rating: 4.9,
    reviews: 140,
    img: rightHero2,
    categorySlug: "lifestyle",
    categoryName: "Lifestyle",
    shortDescription: "Rugged outdoors watch bundle including magnetic charger and 2 extra braided nylon bands.",
    highlights: ["7-Day battery endurance", "MIL-STD-810H durability", "Dual-band satellite tracking", "Offline terrain mapping"],
    specs: [["Battery", "7 Days (GPS on: 30h)"], ["Glass", "Sapphire Crystal"], ["Water Resistance", "10 ATM"], ["Sensors", "Altimeter, Compass, PPG"]],
    searchText: "endurance lifestyle watch with braided straps lifestyle",
  },
];

export const allProducts = [
  ...productSections.flatMap((section) =>
    section.cards.map((card, index) => ({
      ...card,
      key: `${section.key}-${index}`,
      sectionKey: section.key,
      sectionTitle: section.title,
    })),
  ),
  ...showcaseItems,
];

export const parsePrice = (price) => {
  if (typeof price === "number") return isNaN(price) ? 0 : price;
  if (!price) return 0;
  return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
};

export const formatPrice = (value) =>
  `Rs. ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const normalizeApiProduct = (product) => {
  const price = Number(product.price) || 0;
  const mrp = Number(product.mrp) || price;
  const specifications = String(product.keySpecifications || product.spec || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const highlights = [product.spec, ...(product.tags || [])].filter(Boolean).slice(0, 4);
  const specs = [
    ["Brand", product.brand],
    ["Subcategory", product.subcategory],
    ["SKU", product.sku],
    ["Weight", product.weight],
    ["Warranty", product.warranty],
    ["Return policy", product.returnPolicy],
    ...specifications.map((item, index) => [`Specification ${index + 1}`, item]),
  ].filter(([, value]) => value);

  return {
    ...product,
    price,                          // keep as NUMBER for reliable cart arithmetic
    mrp,                            // keep as NUMBER
    priceFormatted: formatPrice(price),   // formatted string for display
    mrpFormatted: mrp > 0 ? formatPrice(mrp) : "",
    img: product.mainImage || product.images?.[0] || rightHero,
    rating: Number(product.rating) || 0,
    reviews: Number(product.numReviews) || product.reviews?.length || 0,
    shortDescription: product.shortDescription || product.description || "",
    fullDescription: product.description || "",
    highlights: highlights.length ? highlights : ["Vendor listed product"],
    specs,
    promo: product.stock > 0 ? "In stock and ready to ship" : "Currently out of stock",
    off: mrp > price ? `${Math.round(((mrp - price) / mrp) * 100)}% OFF` : "",
    searchText: [product.title, product.categoryName, product.spec, ...(product.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
};

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
