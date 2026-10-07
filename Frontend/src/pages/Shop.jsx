import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Filter,
  Grid,
  Heart,
  LaptopMinimal,
  Package,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "../context/useShop";
import { allProducts, normalizeApiProduct, parsePrice, formatPrice } from "../data/products";
import { ModernProductCard } from "../components/ProductsShowcase";
import { apiGetProducts } from "../services/api";
import useCategories from "../hooks/useCategories";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

// Available Brands
const ALL_BRANDS = [
  "Shivra",
  "Sony",
  "Apple",
  "Asus",
  "Bose",
  "Logitech",
  "Boat",
  "HP",
  "Noise",
];

// Available Colors
const ALL_COLORS = [
  { name: "Phantom Black", hex: "#18181B", border: "#27272A" },
  { name: "Mystic Purple", hex: "#4A0D4F", border: "#B35FA3" },
  { name: "Silver Titanium", hex: "#94A3B8", border: "#CBD5E1" },
  { name: "Navy Blue", hex: "#1E3A8A", border: "#3B82F6" },
  { name: "Snow White", hex: "#FFFFFF", border: "#E2E8F0" },
  { name: "Rose Gold", hex: "#FB7185", border: "#FDA4AF" },
];

// Price Brackets
const PRICE_BRACKETS = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 - ₹15,000", min: 5000, max: 15000 },
  { label: "₹15,000 - ₹35,000", min: 15000, max: 35000 },
  { label: "Above ₹35,000", min: 35000, max: Infinity },
];

const Shop = () => {
  const { categorySlug } = useParams();
  const { categories, error: categoriesError } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Param Initializers
  const initialCategory = categorySlug || searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "featured";

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPriceBracket, setSelectedPriceBracket] = useState(0); // Index of PRICE_BRACKETS
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [backendProducts, setBackendProducts] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const products = useMemo(
    () => [...allProducts, ...backendProducts],
    [backendProducts],
  );

  useEffect(() => {
    let isCurrent = true;

    apiGetProducts("limit=1000")
      .then((response) => {
        if (isCurrent) {
          setBackendProducts((response.data?.products || []).map(normalizeApiProduct));
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setCatalogError(error.message || "Unable to load live products.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // Sync category param if URL changes
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    } else if (searchParams.get("category")) {
      setSelectedCategory(searchParams.get("category"));
    } else {
      setSelectedCategory("all");
    }
    if (searchParams.get("q")) {
      setSearchQuery(searchParams.get("q"));
    }
  }, [categorySlug, searchParams]);

  // Handle Category Selection
  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams);
    if (slug === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", slug);
    }
    setSearchParams(newParams);
  };

  // Toggle Brand Selection
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Toggle Color Selection
  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  // Reset All Filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPriceBracket(0);
    setMinRating(0);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
    setSearchParams({});
  };

  // Active Category Details
  const currentCategoryInfo = categories.find(
    (c) => c.slug === selectedCategory
  );

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Category Filter
        if (selectedCategory !== "all") {
          if (product.categorySlug !== selectedCategory) return false;
        }

        // 2. Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchCat = product.categoryName?.toLowerCase().includes(q);
          const matchSpec = product.spec?.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchSpec) return false;
        }

        // 3. Price Filter
        const priceNum = parsePrice(product.price);
        const bracket = PRICE_BRACKETS[selectedPriceBracket];
        if (bracket) {
          if (priceNum < bracket.min || priceNum > bracket.max) return false;
        }

        // 4. Rating Filter
        const ratingNum = parseFloat(product.rating) || 4.5;
        if (minRating > 0 && ratingNum < minRating) return false;

        // 5. Brand Filter (if title or spec matches brand)
        if (selectedBrands.length > 0) {
          const titleLower = product.title.toLowerCase();
          const hasBrand = selectedBrands.some((b) =>
            titleLower.includes(b.toLowerCase())
          );
          if (!hasBrand) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "rating") return ratingB - ratingA;
        if (sortBy === "newest") return b.title.localeCompare(a.title);
        return 0; // featured default
      });
  }, [
    selectedCategory,
    searchQuery,
    selectedPriceBracket,
    minRating,
    selectedBrands,
    sortBy,
    products,
  ]);

  // Active Filters Count
  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    selectedBrands.length +
    selectedColors.length +
    (selectedPriceBracket > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FAF8FC] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {categoriesError && (
          <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">
            {categoriesError}
          </p>
        )}

        {/* ========================================================================= */}
        {/* CATEGORY / SHOP HERO BANNER                                               */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-[28px] border border-purple-200/80 bg-white p-5 sm:p-8 shadow-[0_12px_40px_rgba(74,13,79,0.06)] mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/70 border border-purple-200 px-3 py-0.5 text-[11px] font-bold text-[#4A0D4F] uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>
                    {selectedCategory === "all"
                      ? "Full Product Catalog"
                      : `${currentCategoryInfo?.name || selectedCategory} Collection`}
                  </span>
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {filteredProducts.length} items found
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {selectedCategory === "all"
                  ? "Explore Rare Tech & Premium Gadgets"
                  : currentCategoryInfo?.desc ||
                  `Top rated ${selectedCategory} devices`}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {currentCategoryInfo?.bestFor ||
                  "Browse verified electronics, high-fidelity audio, smartwear, and productivity accessories."}
              </p>
            </div>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect("all")}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${selectedCategory === "all"
                    ? "bg-[#4A0D4F] text-white shadow-sm"
                    : "bg-purple-50 text-slate-700 hover:bg-purple-100"
                  }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${selectedCategory === cat.slug
                      ? "bg-[#4A0D4F] text-white shadow-sm"
                      : "bg-purple-50 text-slate-700 hover:bg-purple-100"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CATALOG LAYOUT: LEFT SIDEBAR FILTERS + RIGHT PRODUCTS GRID           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* ======================================================================= */}
          {/* 1. DESKTOP FILTER SIDEBAR                                               */}
          {/* ======================================================================= */}
          <aside className="hidden lg:block space-y-5 rounded-[24px] border border-purple-100 bg-white p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-purple-50">
              <div className="flex items-center gap-2 text-[#4A0D4F] font-black text-sm">
                <SlidersHorizontal size={16} />
                <span>Filters & Refinements</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline"
                >
                  <RotateCcw size={11} />
                  <span>Reset All ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* A. Categories Filter List */}
            <div className="space-y-2.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Categories
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition ${selectedCategory === "all"
                      ? "bg-purple-100/70 text-[#4A0D4F]"
                      : "text-slate-600 hover:bg-purple-50"
                    }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {products.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  const count = products.filter(
                    (p) => p.categorySlug === cat.slug
                  ).length;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold transition ${isSelected
                          ? "bg-purple-100/70 text-[#4A0D4F]"
                          : "text-slate-600 hover:bg-purple-50"
                        }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. Price Range Filter */}
            <div className="space-y-2.5 pt-3 border-t border-purple-50">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Price Range
              </label>
              <div className="space-y-1.5">
                {PRICE_BRACKETS.map((bracket, idx) => (
                  <label
                    key={bracket.label}
                    className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-purple-50/60"
                  >
                    <input
                      type="radio"
                      name="priceBracket"
                      checked={selectedPriceBracket === idx}
                      onChange={() => setSelectedPriceBracket(idx)}
                      className="accent-[#4A0D4F] h-3.5 w-3.5"
                    />
                    <span>{bracket.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C. Brand Filter */}
            <div className="space-y-2.5 pt-3 border-t border-purple-50">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Brands
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_BRANDS.map((brand) => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition ${isChecked
                          ? "border-[#4A0D4F] bg-purple-100/60 text-[#4A0D4F] font-bold"
                          : "border-slate-100 bg-[#FAF8FC] text-slate-600 hover:border-purple-200 hover:bg-white"
                        }`}
                    >
                      <span>{brand}</span>
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. Color Filter Swatches */}
            <div className="space-y-2.5 pt-3 border-t border-purple-50">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Colors & Finishes
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_COLORS.map((col) => {
                  const isSelected = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => toggleColor(col.name)}
                      title={col.name}
                      className={`relative flex h-7 items-center gap-1.5 rounded-full px-2 text-[10.5px] font-bold border transition ${isSelected
                          ? "border-[#4A0D4F] bg-purple-100 text-[#4A0D4F] ring-1 ring-[#4A0D4F]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                        }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: col.hex,
                          borderColor: col.border,
                        }}
                      />
                      <span>{col.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* E. Minimum Rating */}
            <div className="space-y-2.5 pt-3 border-t border-purple-50">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Customer Rating
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { stars: 0, label: "All" },
                  { stars: 4.0, label: "4.0★ & Up" },
                  { stars: 4.5, label: "4.5★ & Up" },
                  { stars: 4.8, label: "4.8★ & Up" },
                ].map((r) => (
                  <button
                    key={r.stars}
                    type="button"
                    onClick={() => setMinRating(r.stars)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${minRating === r.stars
                        ? "bg-[#4A0D4F] text-white shadow-xs"
                        : "bg-purple-50/70 text-slate-600 hover:bg-purple-100"
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ======================================================================= */}
          {/* 2. RIGHT PRODUCTS GRID & CONTROLS                                       */}
          {/* ======================================================================= */}
          <main className="lg:col-span-3 space-y-4">

            {/* Top Bar: Search, Mobile Filter Toggle, Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-white p-3.5 shadow-xs">

              {/* Search Inside Category */}
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedCategory === "all" ? "products" : selectedCategory
                    }...`}
                  className="w-full rounded-full border border-purple-100 bg-purple-50/30 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Controls Cluster */}
              <div className="flex items-center gap-2.5">
                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/80 px-3.5 py-2 text-xs font-bold text-[#4A0D4F]"
                >
                  <Filter size={14} />
                  <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
                </button>

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="hidden sm:inline text-slate-400">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-purple-100 bg-purple-50/40 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#B35FA3] focus:bg-white cursor-pointer"
                  >
                    <option value="featured">Featured / Best Match</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-purple-100/70 bg-white px-4 py-2.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400">
                  Active Filters:
                </span>

                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-[#4A0D4F] px-2.5 py-0.5 text-xs font-bold">
                    <span>Category: {currentCategoryInfo?.name || selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("all")}
                      className="hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {selectedPriceBracket > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-[#4A0D4F] px-2.5 py-0.5 text-xs font-bold">
                    <span>{PRICE_BRACKETS[selectedPriceBracket].label}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPriceBracket(0)}
                      className="hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {selectedBrands.map((brand) => (
                  <span
                    key={brand}
                    className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-[#4A0D4F] px-2.5 py-0.5 text-xs font-bold"
                  >
                    <span>Brand: {brand}</span>
                    <button
                      type="button"
                      onClick={() => toggleBrand(brand)}
                      className="hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {selectedColors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-[#4A0D4F] px-2.5 py-0.5 text-xs font-bold"
                  >
                    <span>Color: {color}</span>
                    <button
                      type="button"
                      onClick={() => toggleColor(color)}
                      className="hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-[#4A0D4F] px-2.5 py-0.5 text-xs font-bold">
                    <span>Rating: {minRating}★+</span>
                    <button
                      type="button"
                      onClick={() => setMinRating(0)}
                      className="hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-[#4A0D4F] px-2.5 py-0.5 text-xs font-bold">
                    <span>Search: &quot;{searchQuery}&quot;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-rose-600 hover:underline ml-auto"
                >
                  Clear All
                </button>
              </div>
            )}

            {catalogError && (
              <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                Live products could not be loaded: {catalogError}
              </p>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-[28px] border border-purple-100 bg-white py-16 text-center text-slate-400 shadow-xs">
                <Package size={42} className="mx-auto mb-3 opacity-40 text-[#4A0D4F]" />
                <h3 className="text-base font-black text-slate-800">
                  No gadgets match the selected filters
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting the price bracket, clearing brand filters, or searching for another term.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4A0D4F] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#380B3C] transition"
                >
                  <RotateCcw size={13} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredProducts.map((product, idx) => (
                  <ModernProductCard
                    key={product.slug || product.key || idx}
                    card={product}
                    spec={product.spec || "Hi-Res ANC"}
                    rating={product.rating || "4.8/5"}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE FILTER SLIDEOVER MODAL                                          */}
      {/* ========================================================================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end bg-slate-900/60 backdrop-blur-xs lg:hidden">
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-white p-5 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2 text-[#4A0D4F] font-black text-sm">
                  <SlidersHorizontal size={16} />
                  <span>Filter Products</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-slate-500 hover:bg-purple-100"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Mobile Filter Sections */}
              <div className="space-y-4 py-4">
                {/* Categories */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect("all")}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${selectedCategory === "all"
                          ? "bg-[#4A0D4F] text-white"
                          : "bg-purple-50 text-slate-700"
                        }`}
                    >
                      All
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => handleCategorySelect(c.slug)}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${selectedCategory === c.slug
                            ? "bg-[#4A0D4F] text-white"
                            : "bg-purple-50 text-slate-700"
                          }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Brackets */}
                <div className="pt-3 border-t border-purple-50">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-1.5">
                    {PRICE_BRACKETS.map((bracket, idx) => (
                      <label
                        key={bracket.label}
                        className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="mobilePrice"
                          checked={selectedPriceBracket === idx}
                          onChange={() => setSelectedPriceBracket(idx)}
                          className="accent-[#4A0D4F]"
                        />
                        <span>{bracket.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="pt-3 border-t border-purple-50">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                    Brands
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold border ${selectedBrands.includes(brand)
                            ? "border-[#4A0D4F] bg-purple-100 text-[#4A0D4F] font-bold"
                            : "border-slate-200 bg-white text-slate-600"
                          }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-purple-100 flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="w-1/2 rounded-full border border-purple-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-purple-50"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 rounded-full bg-[#4A0D4F] py-2.5 text-xs font-bold text-white shadow-md"
              >
                View {filteredProducts.length} Items
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
