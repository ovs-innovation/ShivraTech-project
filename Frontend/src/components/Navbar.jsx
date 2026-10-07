import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  CarFront,
  ChevronDown,
  Headphones,
  Heart,
  LaptopMinimal,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  User,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/useShop";
import useCategories from "../hooks/useCategories";
import { searchProducts, formatPrice, allProducts, normalizeApiProduct } from "../data/products";
import { apiGetProducts, apiGetBanners, apiRecordBannerClick } from "../services/api";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Shop", to: "/shop" },
  { label: "Contact", to: "/contact" },
];

const categoryIcons = {
  audio: Headphones,
  "mobile-accessories": Smartphone,
  "pc-accessories": LaptopMinimal,
  "car-accessories": CarFront,
  lifestyle: Sparkles,
  robo: Bot,
  robotics: Bot,
};

const Navbar = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropRef = useRef(null);
  const userDropRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, wishlistCount } = useShop();
  const { user, isAuthenticated, isVendor, logout } = useAuth();
  const deferredSearchValue = useDeferredValue(searchValue);
  const trimmedSearch = deferredSearchValue.trim();

  // Top announcement banner
  const [topBanner, setTopBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    apiGetBanners("type=top_strip")
      .then((res) => {
        const strips = Array.isArray(res?.data) ? res.data : (res?.data?.banners || []);
        if (strips.length > 0) {
          setTopBanner(strips[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Backend products loaded once for search suggestions
  const [backendProducts, setBackendProducts] = useState([]);
  useEffect(() => {
    apiGetProducts("limit=500")
      .then((res) => {
        setBackendProducts((res.data?.products || []).map(normalizeApiProduct));
      })
      .catch(() => {}); // silently ignore if backend is down
  }, []);

  // Merge static + backend products for search suggestions
  const allSearchableProducts = useMemo(
    () => [...allProducts, ...backendProducts],
    [backendProducts]
  );

  const suggestions = trimmedSearch
    ? allSearchableProducts
        .filter((p) => {
          const q = trimmedSearch.toLowerCase();
          return (
            p.title?.toLowerCase().includes(q) ||
            p.categoryName?.toLowerCase().includes(q) ||
            p.spec?.toLowerCase().includes(q) ||
            p.searchText?.includes(q)
          );
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setCatOpen(false);
      }
      if (userDropRef.current && !userDropRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCatOpen(false);
      setMobileOpen(false);
      setUserDropdownOpen(false);
      setShowSuggestions(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname, location.search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setShowSuggestions(false);
    const query = searchValue.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] transition-all duration-300">
        {topBanner && !bannerDismissed && (
          <aside
            aria-label="Announcement"
            className="w-full text-xs sm:text-[13px] font-medium py-1.5 px-3 sm:px-6 flex items-center justify-between shadow-xs relative z-50 transition-all border-b border-black/5"
            style={{
              backgroundColor: topBanner.bgColor || "#4A0D4F",
              color: topBanner.textColor || "#ffffff",
            }}
          >
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center truncate">
              {topBanner.badge && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/20">
                  {topBanner.badge}
                </span>
              )}
              <span className="truncate font-semibold">{topBanner.title}</span>
              {topBanner.link && (
                <Link
                  to={topBanner.link}
                  onClick={() => apiRecordBannerClick(topBanner._id).catch(() => {})}
                  className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-85 transition-opacity ml-1.5 flex-shrink-0"
                >
                  {topBanner.buttonText || "Shop Now"} &rarr;
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded-full hover:bg-black/10 transition-colors ml-2 flex-shrink-0 text-current opacity-80 hover:opacity-100"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </aside>
        )}
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3">
          <nav className="flex h-[64px] items-center justify-between gap-4 rounded-full border border-purple-200/80 bg-white/95 px-4 sm:px-6 shadow-[0_8px_30px_rgba(74,13,79,0.06)] backdrop-blur-md transition-all duration-300 hover:border-purple-300/80">
            {/* Logo */}
            <Link
              to="/"
              className="group flex flex-shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]"
            >
              <img
                src={logo}
                alt="Shivra"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#4A0D4F]/10 text-[#4A0D4F]"
                      : "text-slate-600 hover:bg-[#4A0D4F]/5 hover:text-[#4A0D4F]"
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#4A0D4F]/10 text-[#4A0D4F]"
                      : "text-slate-600 hover:bg-[#4A0D4F]/5 hover:text-[#4A0D4F]"
                  }`
                }
              >
                About
              </NavLink>

              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#4A0D4F]/10 text-[#4A0D4F]"
                      : "text-slate-600 hover:bg-[#4A0D4F]/5 hover:text-[#4A0D4F]"
                  }`
                }
              >
                Shop
              </NavLink>

              {/* Categories Dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  type="button"
                  onClick={() => setCatOpen((prev) => !prev)}
                  className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all duration-200 ${
                    catOpen
                      ? "bg-[#4A0D4F]/10 text-[#4A0D4F]"
                      : "text-slate-600 hover:bg-[#4A0D4F]/5 hover:text-[#4A0D4F]"
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {catOpen && (
                  <div
                    className="absolute left-1/2 top-[calc(100%+14px)] w-[360px] sm:w-[540px] -translate-x-1/2 rounded-3xl border border-purple-200 bg-white p-5 shadow-[0_28px_70px_rgba(74,13,79,0.22)]"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#4A0D4F]">
                        Explore Categories
                      </p>
                      <Link
                        to="/categories"
                        onClick={() => setCatOpen(false)}
                        className="text-[11px] font-semibold text-[#B35FA3] hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    {categoriesLoading && categories.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No categories found
                      </div>
                    ) : (
                      <div
                        className={`grid gap-2 ${
                          categories.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-1 sm:grid-cols-2"
                        }`}
                      >
                        {categories.map((category) => {
                          const Icon =
                            categoryIcons[category.slug?.toLowerCase()] ??
                            categoryIcons[category.name?.toLowerCase()] ??
                            Sparkles;
                          return (
                            <Link
                              key={category.slug || category._id}
                              to={`/categories/${category.slug}`}
                              onClick={() => setCatOpen(false)}
                              className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition-all duration-200 hover:border-purple-100 hover:bg-[#F9F2FB]"
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100/60 text-[#4A0D4F] overflow-hidden transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#4A0D4F] group-hover:text-white">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Icon size={18} strokeWidth={2} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 group-hover:text-[#4A0D4F] truncate">
                                  {category.name}
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {category.desc || "Explore gadgets & tech"}
                                </p>
                              </div>
                              <ArrowRight
                                size={13}
                                className="flex-shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#B35FA3]"
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#4A0D4F]/10 text-[#4A0D4F]"
                      : "text-slate-600 hover:bg-[#4A0D4F]/5 hover:text-[#4A0D4F]"
                  }`
                }
              >
                Contact
              </NavLink>
            </div>

            {/* Right Action Section */}
            <div className="flex items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative hidden md:block" ref={searchRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 rounded-full border border-purple-200/70 bg-purple-50/40 px-3.5 py-1.5 shadow-inner transition-all duration-200 hover:bg-white focus-within:border-[#B35FA3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#B35FA3]/20"
                >
                  <Search
                    size={14}
                    className="flex-shrink-0 text-[#4A0D4F]/70"
                    strokeWidth={2.2}
                  />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => {
                      setSearchValue(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      if (trimmedSearch) setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder="Search gadgets..."
                    className="w-24 xl:w-36 bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue("");
                        setShowSuggestions(false);
                      }}
                      className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-purple-100 hover:text-slate-700 transition"
                      title="Clear search"
                    >
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                </form>

                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="absolute right-0 top-[calc(100%+12px)] w-[320px] rounded-2xl border border-purple-200 bg-white p-2.5 shadow-[0_24px_60px_rgba(74,13,79,0.2)] animate-in fade-in duration-150"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="space-y-1">
                      {suggestions.map((product) => (
                        <Link
                          key={product.slug}
                          to={`/product/${product.slug}`}
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchValue("");
                          }}
                          className="flex items-center gap-2.5 rounded-xl p-2 transition hover:bg-[#F9F2FB]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50/80 flex-shrink-0">
                            <img
                              src={product.img}
                              alt={product.title}
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {product.title}
                            </p>
                            <p className="text-[10.5px] text-slate-500">
                              {product.categoryName}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#4A0D4F]">
                            {product.priceFormatted || (typeof product.price === "number" ? formatPrice(product.price) : product.price)}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={`/shop?q=${encodeURIComponent(trimmedSearch)}`}
                      onClick={() => {
                        setShowSuggestions(false);
                      }}
                      className="mt-2 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#4A0D4F] hover:bg-purple-50"
                    >
                      <span>View all matching results</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Cluster (Wishlist, Cart, User) */}
              <div className="flex items-center gap-1 rounded-full border border-purple-200/60 bg-purple-50/40 p-1">
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition-all duration-200 hover:bg-white hover:text-[#4A0D4F] hover:shadow-xs"
                  aria-label="Liked Products"
                  title="Liked / Saved Products"
                >
                  <Heart
                    size={16}
                    strokeWidth={2}
                    className={wishlistCount > 0 ? "text-rose-500 fill-rose-500" : ""}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-700 transition-all duration-200 hover:bg-white hover:text-[#4A0D4F] hover:shadow-xs"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart size={16} strokeWidth={2} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4A0D4F] px-1 text-[9px] font-extrabold text-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Profile / Login Dropdown */}
                <div className="relative" ref={userDropRef}>
                  {isAuthenticated && user ? (
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen((prev) => !prev)}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-white px-2.5 text-[#4A0D4F] shadow-xs transition hover:bg-purple-50"
                      aria-label="User profile"
                    >
                      <User size={14} strokeWidth={2.2} />
                      <span className="text-xs font-bold max-w-[70px] truncate">
                        {user.name?.split(" ")[0]}
                      </span>
                      <ChevronDown size={11} className={`transition-transform duration-150 ${userDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-bold text-[#4A0D4F] shadow-xs transition hover:bg-purple-50"
                      aria-label="Account Login"
                    >
                      <User size={14} strokeWidth={2.2} />
                      <span>Login</span>
                    </Link>
                  )}

                  {/* Profile Menu Dropdown - SOLID OPAQUE WHITE */}
                  {userDropdownOpen && isAuthenticated && user && (
                    <div
                      className="absolute right-0 top-[calc(100%+12px)] w-64 rounded-2xl border border-purple-200 bg-white p-3.5 shadow-[0_24px_60px_rgba(74,13,79,0.22)]"
                      style={{ zIndex: 1000 }}
                    >
                      <div className="pb-2.5 mb-2.5 border-b border-purple-100">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A0D4F] text-white font-bold text-xs flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                            <p className="text-[10.5px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            user.role === "seller"
                              ? "bg-purple-100 text-[#4A0D4F] border border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {user.role === "seller" ? "Verified Vendor" : "Customer Account"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {isVendor ? (
                          <>
                            <Link
                              to="/vendor/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-[#4A0D4F] hover:bg-purple-50 transition"
                            >
                              <Store size={15} />
                              <span>Vendor Dashboard</span>
                            </Link>
                            <Link
                              to="/vendor/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#4A0D4F] transition"
                            >
                              <Package size={15} />
                              <span>My Inventory Catalog</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#4A0D4F] transition"
                            >
                              <ShoppingBag size={15} />
                              <span>My Orders & Tracking</span>
                            </Link>
                            <Link
                              to="/wishlist"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#4A0D4F] transition"
                            >
                              <Heart size={15} className="text-rose-500" />
                              <span>Liked Products ({wishlistCount})</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-purple-100">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            navigate("/login");
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Role-Specific Clean Pill Button */}
              {isVendor ? (
                <Link
                  to="/vendor/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#4A0D4F] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#380B3C] active:scale-95"
                >
                  <Store size={13} />
                  <span>Vendor Hub</span>
                </Link>
              ) : (
                <Link
                  to="/shop"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#4A0D4F] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#380B3C] active:scale-95"
                >
                  <span>Explore Shop</span>
                  <ArrowRight size={13} />
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-200/70 bg-purple-50/50 text-[#4A0D4F] transition lg:hidden hover:bg-white"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="mx-3 mt-2 rounded-3xl border border-purple-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="space-y-1">
              {[
                ...navLinks,
                { label: "Categories", to: "/categories" },
                { label: `Liked Products (${wishlistCount})`, to: "/wishlist" },
              ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `block rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold transition ${
                        isActive
                          ? "bg-purple-100/70 text-[#4A0D4F]"
                          : "text-slate-700 hover:bg-purple-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ),
              )}
              {isVendor && (
                <NavLink
                  to="/vendor/dashboard"
                  className="flex items-center gap-2 rounded-2xl bg-purple-50 px-4 py-2 text-xs sm:text-sm font-bold text-[#4A0D4F]"
                >
                  <Store size={14} />
                  <span>Vendor Dashboard</span>
                </NavLink>
              )}
            </div>

            {/* Mobile Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-3 flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/50 px-3.5 py-2"
            >
              <Search size={14} className="text-[#4A0D4F]" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
            </form>
          </div>
        )}
      </header>

      {/* Spacing under fixed navbar */}
      <div className="h-[76px] sm:h-[82px]" />
    </>
  );
};

export default Navbar;
