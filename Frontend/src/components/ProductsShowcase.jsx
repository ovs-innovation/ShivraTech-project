import React, { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import categoryCar from "../assets/categoryCar.jpg";
import categorySpeaker from "../assets/categorySpeaker.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";
import { useShop } from "../context/useShop";
import { categories } from "../data/catalog";
import {
  allProducts,
  searchProducts,
} from "../data/products";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";
const SECTION_BG =
  "linear-gradient(180deg, #fbf5f9 0%, #ffffff 48%, #f7eef5 100%)";
const IMAGE_PANEL_BG =
  "linear-gradient(180deg, rgba(179,95,163,0.14) 0%, rgba(244,232,243,0.5) 36%, #ffffff 100%)";

const blogSlides = [
  [
    {
      title: "How to make your gadget listings stand out in local search",
      date: "March 28, 2026",
      tag: "Seller guide",
      img: categorySpeaker,
    },
    {
      title: "Desk setup accessory bundles that increase add-on sales",
      date: "March 22, 2026",
      tag: "Sales tips",
      img: categoryWatch,
    },
    {
      title: "Smart ways to promote audio gadgets before festive weekends",
      date: "March 16, 2026",
      tag: "Marketing",
      img: categoryCar,
    },
  ],
  [
    {
      title: "Why same-day delivery builds trust for gadget buyers",
      date: "March 12, 2026",
      tag: "Delivery",
      img: categoryWatch,
    },
    {
      title: "Best product photo ideas for local electronics sellers",
      date: "March 8, 2026",
      tag: "Content",
      img: categorySpeaker,
    },
    {
      title: "Finance offers that help shoppers convert faster online",
      date: "March 3, 2026",
      tag: "Payments",
      img: categoryCar,
    },
  ],
  [
    {
      title: "How to build repeat customers with reliable gadget support",
      date: "February 25, 2026",
      tag: "Retention",
      img: categoryCar,
    },
    {
      title: "Top smartwatch and lifestyle accessories trending this month",
      date: "February 19, 2026",
      tag: "Trends",
      img: categoryWatch,
    },
    {
      title: "Hyper-local ad ideas for stores selling tech accessories",
      date: "February 13, 2026",
      tag: "Ads",
      img: categorySpeaker,
    },
  ],
];

const ProductCard = ({ card }) => {
  const navigate = useNavigate();
  const { addToCart } = useShop();
  const productLink = `/product/${card.slug}`;

  const handleAddToCart = () => {
    addToCart(card);
  };

  const handleBuyNow = () => {
    addToCart(card);
    navigate("/cart");
  };

  return (
    <article
      className="group relative overflow-hidden rounded-[18px] border bg-white p-2.5 shadow-[0_4px_16px_rgba(74,13,79,0.08)] sm:p-3"
      style={{ borderColor: "#eadbe6" }}
    >
      <div
        className="absolute left-0 top-0 z-10 max-w-[72%] rounded-br-xl px-3 py-2 text-[10px] font-bold uppercase tracking-[0.04em] text-white sm:max-w-[78%] sm:text-[11px]"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
        }}
      >
        {card.promo}
      </div>

      <button
        type="button"
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-400 shadow-sm"
        aria-label={`Save ${card.title}`}
      >
        <Heart size={16} strokeWidth={2} />
      </button>

      <Link
        to={productLink}
        className="mt-9 block rounded-2xl"
        style={{ background: IMAGE_PANEL_BG }}
      >
        <div className="flex h-[11.5rem] items-center justify-center px-3 py-3 sm:h-[12.75rem]">
          <img
            src={card.img}
            alt={card.title}
            className="h-[96%] w-[96%] object-contain transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="space-y-3 px-1 pb-1 pt-4 text-left">
        <Link
          to={`/categories#${card.categorySlug}`}
          className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
        >
          {card.categoryName}
        </Link>

        <Link to={productLink} className="block">
          <h3 className="min-h-[3.25rem] text-[15px] font-medium leading-6 text-slate-800 line-clamp-2 transition group-hover:text-[#4A0D4F] sm:min-h-[3.5rem]">
            {card.title}
          </h3>
        </Link>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[17px] font-bold text-slate-900">
              {card.price}
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              {card.off}
            </span>
          </div>
          <p className="text-sm text-slate-400 line-through">MRP {card.mrp}</p>
        </div>

        <div className="flex items-center gap-1 pt-1">
          {Array.from({ length: 5 }).map((_, starIdx) => (
            <Star
              key={starIdx}
              size={15}
              fill={starIdx < card.rating ? "#f59e0b" : "transparent"}
              color={starIdx < card.rating ? "#f59e0b" : "#d1d5db"}
            />
          ))}
          <span className="ml-1 text-[13px] font-semibold text-slate-600">
            ({card.reviews})
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-full border px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] sm:text-[11px]"
            style={{
              borderColor: ACCENT,
              color: PRIMARY,
              backgroundColor: "#fff",
            }}
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="rounded-full px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-white sm:text-[11px]"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
            }}
          >
            Buy now
          </button>
        </div>
      </div>
    </article>
  );
};

const ProductsShowcase = ({ shopOnly = false, searchQuery = "" }) => {
  const [activeBlogSlide, setActiveBlogSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const homeProducts = allProducts.slice(0, 8);

  const normalizedSearchQuery = searchQuery.trim();

  const availableCategories = categories.filter((category) =>
    allProducts.some((product) => product.categorySlug === category.slug),
  );

  const searchedProducts = normalizedSearchQuery
    ? searchProducts(normalizedSearchQuery)
    : allProducts;

  const filteredProducts =
    activeCategory === "all"
      ? searchedProducts
      : searchedProducts.filter((product) => product.categorySlug === activeCategory);

  useEffect(() => {
    if (shopOnly) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setActiveBlogSlide((current) => (current + 1) % blogSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, [shopOnly]);

  if (shopOnly) {
    return (
      <section
        id="featured"
        className="px-4 py-12 sm:px-6 sm:py-16"
        style={{ background: SECTION_BG }}
      >
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3 text-left">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Shop
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {normalizedSearchQuery ? `Search: ${normalizedSearchQuery}` : "All products"}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              {normalizedSearchQuery
                ? "Matching products from across the ShivraTech catalog."
                : "Browse every product with category filters in one place."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                borderColor: activeCategory === "all" ? PRIMARY : "#eadbe6",
                backgroundColor: activeCategory === "all" ? "#f4e8f3" : "#fff",
                color: PRIMARY,
              }}
            >
              All ({searchedProducts.length})
            </button>
            {availableCategories.map((category) => {
              const count = searchedProducts.filter(
                (product) => product.categorySlug === category.slug,
              ).length;

              if (count === 0) {
                return null;
              }

              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setActiveCategory(category.slug)}
                  className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{
                    borderColor:
                      activeCategory === category.slug ? PRIMARY : "#eadbe6",
                    backgroundColor:
                      activeCategory === category.slug ? "#f4e8f3" : "#fff",
                    color: PRIMARY,
                  }}
                >
                  {category.name} ({count})
                </button>
              );
            })}
          </div>

          <p className="text-sm font-medium text-slate-500">
            Showing {filteredProducts.length} products
          </p>

          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((card) => (
                <ProductCard key={card.key} card={card} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-[28px] border bg-white px-8 py-10 text-center"
              style={{ borderColor: "#eadbe6" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: PRIMARY }}
              >
                No matches
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                No products found for "{normalizedSearchQuery}"
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Try product names like audio, power bank, keyboard, car charger,
                or smartwatch.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="featured"
      className="px-4 py-12 sm:px-6 sm:py-16"
      style={{ background: SECTION_BG }}
    >
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-2 text-left">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PRIMARY }}
          >
            Product showcase
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Best deals for your customers
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Professional ecommerce cards with cleaner sizing, stronger images,
            and aligned product details.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: PRIMARY }}
              >
                Featured products
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                Two rows of top picks
              </h3>
            </div>
            <Link
              to="/shop"
              className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ borderColor: ACCENT, color: PRIMARY }}
            >
              View all
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {homeProducts.map((card) => (
              <ProductCard key={card.key} card={card} />
            ))}
          </div>

          <div
            className="rounded-[20px] border bg-white px-4 py-5 sm:px-6"
            style={{ borderColor: "#eadbe6" }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <span
                  className="w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                  style={{ backgroundColor: "#fbf5f9", color: PRIMARY }}
                >
                  ShivraTech Promise
                </span>
                <div className="flex flex-col gap-2 text-center md:flex-row md:items-center md:text-left">
                  <h4 className="text-2xl font-black uppercase tracking-[0.04em] text-slate-900 sm:text-4xl">
                    Order Today
                  </h4>
                  <span
                    className="hidden h-8 w-px md:block"
                    style={{ backgroundColor: "#eadbe6" }}
                  />
                  <h4
                    className="text-2xl font-black uppercase tracking-[0.04em] sm:text-4xl"
                    style={{ color: ACCENT }}
                  >
                    Get It Today
                  </h4>
                </div>
              </div>
              <p className="max-w-md text-center text-sm font-medium leading-6 text-slate-500 md:text-right">
                Fast local delivery on selected gadgets from trusted sellers
                across your city.
              </p>
            </div>
          </div>
        </div>

        <div
          id="insights"
          className="space-y-6 border-t pt-12 scroll-mt-28"
          style={{ borderColor: "#eadbe6" }}
        >
          <div className="space-y-2 text-left">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Blog posts
            </p>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              Insights for sellers and shoppers
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Fresh ideas from ShivraTech on selling smarter, delivering faster,
              and growing gadget demand locally.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {blogSlides[activeBlogSlide].map((post) => (
              <article key={post.title} className="space-y-4">
                <div
                  className="group overflow-hidden rounded-[22px] border bg-white p-2"
                  style={{ borderColor: "#eadbe6" }}
                >
                  <div className="relative overflow-hidden rounded-[18px]">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent" />
                    <img
                      src={post.img}
                      alt={post.title}
                      className="h-[15rem] w-full object-cover transition duration-300 group-hover:scale-105 sm:h-[17rem]"
                      loading="lazy"
                    />
                    <div className="absolute left-4 top-4 z-20">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                        }}
                      >
                        {post.tag}
                      </span>
                    </div>
                    <div className="absolute inset-x-4 bottom-4 z-20">
                      <Link
                        to="/contact"
                        className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: PRIMARY }}
                      >
                        Read now
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <h4 className="text-[15px] font-semibold leading-7 text-slate-800 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-slate-400">{post.date}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            {blogSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Show blog slide ${idx + 1}`}
                onClick={() => setActiveBlogSlide(idx)}
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: activeBlogSlide === idx ? "1.75rem" : "0.75rem",
                  backgroundColor: activeBlogSlide === idx ? ACCENT : "#d7d3db",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsShowcase;
