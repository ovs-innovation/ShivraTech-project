import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

const categories = [
  { name: "Audio", slug: "audio", desc: "Studio headphones, ANC earphones, and smart room speakers" },
  { name: "Mobile Accessories", slug: "mobile-accessories", desc: "Cases, MagSafe power banks, fast chargers, and cords" },
  { name: "PC Accessories", slug: "pc-accessories", desc: "Mechanical keyboards, OLED monitors, and wireless mice" },
  { name: "Car Accessories", slug: "car-accessories", desc: "Smart dash displays, magnetic mounts, and ambient LED kits" },
  { name: "Lifestyle", slug: "lifestyle", desc: "Smart rings, titanium wearables, and desk lamps" },
];

const sampleProducts = [
  {
    title: "Shivra Aura Studio Wireless ANC Headphones",
    slug: "wireless-studio-headphones",
    description: "Premium studio acoustic engineering with active noise cancellation, custom plum lambskin ear cushions, 40-hour battery life, and spatial audio dynamic head tracking.",
    price: 18999,
    mrp: 22999,
    categorySlug: "audio",
    categoryName: "Audio",
    spec: "Hi-Res ANC",
    stock: 25,
    rating: 4.9,
    numReviews: 38,
    isFeatured: true,
    isFlashSale: false,
    isNewArrival: true,
    tags: ["Headphone", "Audio", "ANC", "Wireless"],
  },
  {
    title: "Asus Zenbook 14 OLED Core Ultra 7",
    slug: "asus-zenbook-14-oled",
    description: "14-inch 3K 120Hz Lumina OLED display, Intel Core Ultra 7 processor, 16GB LPDDR5X RAM, and 512GB PCIe 4.0 SSD in an ultra-portable titanium chassis.",
    price: 65200,
    mrp: 70200,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    spec: "16/512GB",
    stock: 14,
    rating: 4.8,
    numReviews: 24,
    isFeatured: true,
    isFlashSale: true,
    isNewArrival: false,
    tags: ["Laptop", "OLED", "PC"],
  },
  {
    title: "Titanium Precision Wireless Ergonomic Mouse",
    slug: "wireless-ergonomic-mouse",
    description: "High-precision 4000 DPI optical sensor, quiet click mechanics, multi-device Bluetooth pairing, and ergonomic thumb rest for all-day comfort.",
    price: 3499,
    mrp: 4299,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    spec: "4000 DPI",
    stock: 40,
    rating: 4.8,
    numReviews: 52,
    isFeatured: false,
    isFlashSale: true,
    isNewArrival: false,
    tags: ["Mouse", "Wireless", "Ergonomic"],
  },
  {
    title: "27-inch Frameless Ultra-Wide 165Hz IPS Monitor",
    slug: "curved-gaming-monitor",
    description: "QHD 2560x1440 resolution, 165Hz rapid refresh rate, 1ms response time, HDR400 color grading, and USB-C display connectivity.",
    price: 24900,
    mrp: 29999,
    categorySlug: "pc-accessories",
    categoryName: "PC Accessories",
    spec: "165Hz 1ms",
    stock: 18,
    rating: 4.8,
    numReviews: 19,
    isFeatured: false,
    isFlashSale: true,
    isNewArrival: true,
    tags: ["Monitor", "IPS", "Gaming"],
  },
  {
    title: "Aura Pods ANC Pro with Smart Case Display",
    slug: "aura-pods-anc",
    description: "Touchscreen smart charging case, 32dB active noise cancellation, dual transparency modes, and waterproof IPX5 workout rating.",
    price: 9999,
    mrp: 12999,
    categorySlug: "audio",
    categoryName: "Audio",
    spec: "ANC 32dB",
    stock: 30,
    rating: 4.9,
    numReviews: 64,
    isFeatured: true,
    isFlashSale: false,
    isNewArrival: true,
    tags: ["Earbuds", "Audio", "ANC"],
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log("[Seed] Cleaning existing categories and products...");
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("[Seed] Inserting categories...");
    await Category.insertMany(categories);

    // Find or create default demo vendor
    let vendor = await User.findOne({ email: "vendor@shivratech.com" });
    if (!vendor) {
      vendor = await User.create({
        name: "ABC Electronics",
        email: "vendor@shivratech.com",
        password: "password123",
        role: "seller",
        storeName: "ABC Electronics Official",
        phone: "+91 98765 43210",
        isVerifiedSeller: true,
      });
      console.log("[Seed] Demo Vendor created: vendor@shivratech.com / password123");
    }

    // Find or create demo customer
    let customer = await User.findOne({ email: "customer@shivratech.com" });
    if (!customer) {
      customer = await User.create({
        name: "Rahul Sharma",
        email: "customer@shivratech.com",
        password: "password123",
        role: "customer",
        phone: "+91 91234 56789",
      });
      console.log("[Seed] Demo Customer created: customer@shivratech.com / password123");
    }

    const productsWithVendor = sampleProducts.map((p) => ({
      ...p,
      seller: vendor._id,
      sellerName: vendor.storeName,
    }));

    await Product.insertMany(productsWithVendor);
    console.log(`[Seed] Seeded ${productsWithVendor.length} products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("[Seed Error]", error.message);
    process.exit(1);
  }
};

seedData();
