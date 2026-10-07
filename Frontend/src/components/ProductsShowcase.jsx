import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Plus, Sparkles, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useShop } from "../context/useShop";
import { formatPrice, normalizeApiProduct } from "../data/products";
import { apiGetProducts } from "../services/api";
import categoryLaptop from "../assets/categoryLaptop.jpg";
import categoryMouse from "../assets/categoryMouse.jpg";
import categoryMonitor from "../assets/categoryMonitor.jpg";
import categoryPhone from "../assets/categoryPhone.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";
import heroCenterHeadphone from "../assets/heroCenterHeadphone.png";
import rightHero from "../assets/rightHero.png";
import rightHero1 from "../assets/rightHero1.png";
import rightHero2 from "../assets/rightHero2.png";
import floatingEarbudsCard from "../assets/floatingEarbudsCard.jpg";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

// Clean Product Card matching Reference Image 2 with Framer Motion 3D Hover
export const ModernProductCard = ({
  card,
  spec = "16/512GB",
  rating = "4.8/5",
  index = 0,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useShop();
  const [added, setAdded] = useState(false);
  const isLiked = isInWishlist(card.slug || card.key);
  const productLink = `/product/${card.slug || "item"}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(card);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 5) * 0.07 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-2.5 sm:p-3 shadow-xs transition-shadow duration-300 hover:border-purple-200 hover:shadow-[0_14px_36px_rgba(74,13,79,0.11)]"
    >
      
      {/* Top Bar: Wishlist Heart on Top Right */}
      <div className="flex justify-end mb-0.5 sm:mb-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(card);
          }}
          className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border transition-all ${
            isLiked
              ? "border-rose-200 bg-rose-50 text-rose-500 shadow-xs"
              : "border-slate-100 bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200"
          }`}
          aria-label={isLiked ? "Remove from liked products" : "Save as liked product"}
          title={isLiked ? "Saved in Liked Products" : "Save as Liked Product"}
        >
          <Heart size={12} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.2} className="sm:hidden" />
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.2} className="hidden sm:block" />
        </motion.button>
      </div>

      {/* Product Image Area */}
      <Link
        to={productLink}
        className="relative flex h-28 xs:h-32 sm:h-40 w-full items-center justify-center rounded-xl bg-[#F8F9FA] p-2 sm:p-2.5 transition-colors duration-300 group-hover:bg-[#FAF6FB]"
      >
        <img
          src={card.img}
          alt={card.title}
          className="h-full w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Product Details (Specs, Rating, Title, Price, Plus Button) */}
      <div className="mt-2 sm:mt-3 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          {/* Spec & Rating Row (Reference Image 2) */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400 mb-0.5 sm:mb-1">
            <span className="truncate max-w-[55%]">{spec}</span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold">
              <Star size={10} fill="currentColor" />
              <span>({rating})</span>
            </div>
          </div>

          <Link to={productLink} className="block">
            <h3 className="line-clamp-2 text-[11.5px] xs:text-xs sm:text-[13px] font-bold text-slate-800 transition group-hover:text-[#4A0D4F] leading-snug">
              {card.title}
            </h3>
          </Link>
        </div>

        {/* Price & Purple Plus Add-to-Cart Button (Reference Image 2) */}
        <div className="pt-1.5 flex items-center justify-between border-t border-slate-50">
          <div>
            <span className="block text-xs xs:text-[13.5px] sm:text-base font-black text-slate-900">
              {card.priceFormatted || (typeof card.price === "number" ? formatPrice(card.price) : card.price)}
            </span>
            {(card.mrpFormatted || card.mrp) && (
              <span className="block text-[9px] xs:text-[10px] font-medium text-slate-400 line-through">
                {card.mrpFormatted || (typeof card.mrp === "number" ? formatPrice(card.mrp) : card.mrp)}
              </span>
            )}
          </div>

          {/* Purple Circular Plus Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 shadow-xs ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-[#26052B] text-white hover:bg-[#4A0D4F] hover:shadow-md"
            }`}
            aria-label="Add to cart"
            title="Add to Cart"
          >
            {added ? (
              <span className="text-[10px] sm:text-[11px] font-bold">✓</span>
            ) : (
              <Plus size={14} strokeWidth={2.5} className="sm:hidden" />
            )}
            {!added && <Plus size={16} strokeWidth={2.5} className="hidden sm:block" />}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

const ProductCarousel = ({ products, ariaLabel }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((card, index) => (
          <div
            key={card.slug}
            className="w-[calc(50%-7px)] shrink-0 snap-start sm:w-[calc(33.333%-10px)] lg:w-[calc(25%-11px)] xl:w-[calc(20%-12px)]"
          >
            <ModernProductCard
              card={card}
              spec={card.spec}
              rating={card.rating}
              index={index}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${ariaLabel} left`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-200 bg-white text-[#4A0D4F] shadow-sm transition hover:border-[#4A0D4F] hover:bg-purple-50"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${ariaLabel} right`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-200 bg-white text-[#4A0D4F] shadow-sm transition hover:border-[#4A0D4F] hover:bg-purple-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// Red Timer Pill Badge matching Reference Image 2 Top
const FlashSaleTimer = () => {
  const [time, setTime] = useState({ d: "02", h: "08", m: "04", s: "21" });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        d: "02",
        h: String(now.getHours()).padStart(2, "0"),
        m: String(now.getMinutes()).padStart(2, "0"),
        s: String(now.getSeconds()).padStart(2, "0"),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black">
      <span className="rounded-md bg-[#EF4444] text-white px-2 py-0.5 shadow-xs">
        {time.d}D
      </span>
      <span className="rounded-md bg-[#EF4444] text-white px-2 py-0.5 shadow-xs">
        {time.h}H
      </span>
      <span className="rounded-md bg-[#EF4444] text-white px-2 py-0.5 shadow-xs">
        {time.m}M
      </span>
      <span className="rounded-md bg-[#EF4444] text-white px-2 py-0.5 shadow-xs">
        {time.s}S
      </span>
    </div>
  );
};

// Flash Sale Product Data
const flashSaleList = [
  {
    slug: "asus-zenbook-14-oled",
    title: "Asus Zenbook 14 OLED Core Ultra 7",
    price: "Rs. 65,200",
    mrp: "Rs. 70,200",
    spec: "16/512GB",
    rating: "4.8/5",
    img: categoryLaptop,
  },
  {
    slug: "macbook-air-m3",
    title: "Ultra Slim Book 14 IPS Quad HD 16GB",
    price: "Rs. 58,999",
    mrp: "Rs. 64,500",
    spec: "16/512GB",
    rating: "4.9/5",
    img: categoryLaptop,
  },
  {
    slug: "hp-spectre-pro",
    title: "Creator Studio Pro 15.6 FHD Ryzen 7",
    price: "Rs. 62,400",
    mrp: "Rs. 68,000",
    spec: "16/1TB",
    rating: "4.7/5",
    img: categoryLaptop,
  },
  {
    slug: "wireless-ergonomic-mouse",
    title: "Titanium Precision Wireless Ergonomic Mouse",
    price: "Rs. 3,499",
    mrp: "Rs. 4,299",
    spec: "4000 DPI",
    rating: "4.8/5",
    img: categoryMouse,
  },
  {
    slug: "curved-gaming-monitor",
    title: "27-inch Frameless Ultra-Wide 165Hz IPS Monitor",
    price: "Rs. 24,900",
    mrp: "Rs. 29,999",
    spec: "165Hz 1ms",
    rating: "4.8/5",
    img: categoryMonitor,
  },
];

// Featured Product Data
const featuredList = [
  {
    slug: "wireless-studio-headphones",
    title: "Shivra Aura Studio Wireless ANC Headphones",
    price: "Rs. 18,999",
    mrp: "Rs. 22,999",
    spec: "Hi-Res ANC",
    rating: "4.9/5",
    img: heroCenterHeadphone,
  },
  {
    slug: "pro-audio-headset",
    title: "Deep Bass Bluetooth Headset with Spatial Mic",
    price: "Rs. 12,499",
    mrp: "Rs. 15,999",
    spec: "40h Play",
    rating: "4.8/5",
    img: rightHero,
  },
  {
    slug: "smart-watch-titanium",
    title: "Aura Smart Watch Pro AMOLED with Heart Track",
    price: "Rs. 14,999",
    mrp: "Rs. 17,999",
    spec: "AMOLED GPS",
    rating: "4.8/5",
    img: categoryWatch,
  },
  {
    slug: "flagship-smartphone-pro",
    title: "Titanium Pro 5G Flagship Dual SIM 256GB",
    price: "Rs. 79,900",
    mrp: "Rs. 89,900",
    spec: "256GB 5G",
    rating: "4.9/5",
    img: categoryPhone,
  },
  {
    slug: "precision-rgb-mouse",
    title: "Optical Speed Sensor Gaming Mouse Silent Clicks",
    price: "Rs. 2,999",
    mrp: "Rs. 3,799",
    spec: "Silent Click",
    rating: "4.7/5",
    img: categoryMouse,
  },
];

// New Arrivals Data
const newArrivalsList = [
  {
    slug: "aura-pods-anc",
    title: "Aura Pods ANC Pro with Smart Case Display",
    price: "Rs. 9,999",
    mrp: "Rs. 12,999",
    spec: "ANC 32dB",
    rating: "4.9/5",
    img: floatingEarbudsCard,
  },
  {
    slug: "fast-charge-car-kit",
    title: "Smart Drive Media Kit & Magnetic Car Power",
    price: "Rs. 21,999",
    mrp: "Rs. 24,000",
    spec: "65W Fast",
    rating: "4.8/5",
    img: rightHero1,
  },
  {
    slug: "desk-setup-bundle",
    title: "Mechanical Pro Keypad & Creator Desk Hub",
    price: "Rs. 18,499",
    mrp: "Rs. 22,499",
    spec: "Multi-Hub",
    rating: "4.8/5",
    img: rightHero2,
  },
  {
    slug: "smart-audio-pod",
    title: "Compact Room Sound Pod 360 Party Bass",
    price: "Rs. 17,999",
    mrp: "Rs. 19,999",
    spec: "360 Audio",
    rating: "4.7/5",
    img: rightHero1,
  },
  {
    slug: "travel-smart-watch-bundle",
    title: "Endurance Lifestyle Watch with Braided Straps",
    price: "Rs. 19,999",
    mrp: "Rs. 21,999",
    spec: "7-Day Bat",
    rating: "4.9/5",
    img: rightHero2,
  },
];

const ProductsShowcase = ({ shopOnly = false }) => {
  const [productSections, setProductSections] = useState({
    flashSale: flashSaleList,
    featured: featuredList,
    newArrivals: newArrivalsList,
  });
  const [productSectionsError, setProductSectionsError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    Promise.all([
      apiGetProducts("flashSale=true&limit=1000"),
      apiGetProducts("featured=true&limit=1000"),
      apiGetProducts("newArrival=true&limit=1000"),
    ])
      .then(([flashSaleResponse, featuredResponse, newArrivalsResponse]) => {
        const responseProducts = [
          flashSaleResponse.data?.products,
          featuredResponse.data?.products,
          newArrivalsResponse.data?.products,
        ];
        if (responseProducts.some((products) => !Array.isArray(products))) {
          throw new Error("The products response is invalid.");
        }

        const liveSections = {
          flashSale: responseProducts[0].map(normalizeApiProduct),
          featured: responseProducts[1].map(normalizeApiProduct),
          newArrivals: responseProducts[2].map(normalizeApiProduct),
        };

        if (isCurrent) {
          setProductSections({
            flashSale: liveSections.flashSale.length
              ? liveSections.flashSale
              : flashSaleList,
            featured: liveSections.featured.length
              ? liveSections.featured
              : featuredList,
            newArrivals: liveSections.newArrivals.length
              ? liveSections.newArrivals
              : newArrivalsList,
          });
          setProductSectionsError("");
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setProductSectionsError(
            error.message || "Unable to load updated showcase products.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="bg-[#FAF8FC] py-10 sm:py-16 space-y-12 sm:space-y-16 overflow-hidden">
      {productSectionsError && (
        <p
          className="mx-auto max-w-7xl px-4 text-sm font-semibold text-rose-600 sm:px-6 lg:px-8"
          role="status"
        >
          {productSectionsError}
        </p>
      )}
      
      {/* 1. FLASH SALE SECTION (MATCHING REFERENCE IMAGE 2 TOP) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-purple-100">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Flash Sale
            </h2>
            <FlashSaleTimer />
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A0D4F] hover:text-[#B35FA3] transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <ProductCarousel products={productSections.flashSale} ariaLabel="flash sale products" />
      </motion.section>

      {/* 2. FEATURED PRODUCT SECTION (MATCHING REFERENCE IMAGE 2 BOTTOM) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-purple-100">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Featured Product
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A0D4F] hover:text-[#B35FA3] transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <ProductCarousel products={productSections.featured} ariaLabel="featured products" />
      </motion.section>

      {/* 3. NEW ARRIVALS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between gap-3 mb-6 pb-2 border-b border-purple-100">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>New Arrivals</span>
              <Sparkles size={18} className="text-[#B35FA3]" />
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4A0D4F] hover:text-[#B35FA3] transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <ProductCarousel products={productSections.newArrivals} ariaLabel="new arrival products" />
      </motion.section>

    </div>
  );
};

export default ProductsShowcase;
