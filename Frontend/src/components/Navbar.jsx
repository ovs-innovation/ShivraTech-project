import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CarFront,
  ChevronDown,
  Headphones,
  Heart,
  LaptopMinimal,
  Menu,
  Search,
  ShoppingCart,
  Smartphone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { categories } from "../data/catalog";
import { searchProducts } from "../data/products";

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
};

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const navLinkClassName = ({ isActive }) =>
  `rounded-xl px-3.5 py-2 text-[13px] font-semibold no-underline transition ${
    isActive ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
  }`;

const Navbar = () => {
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const deferredSearchValue = useDeferredValue(searchValue);
  const trimmedSearch = deferredSearchValue.trim();
  const suggestions = trimmedSearch
    ? searchProducts(trimmedSearch).slice(0, 5)
    : [];

  useEffect(() => {
    const handler = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setCatOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCatOpen(false);
      setMobileOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.hash, location.pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();

    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b shadow-sm backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}, ${PRIMARY})`,
          borderColor: `${ACCENT}33`,
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-6">
          <Link to="/" className="-ml-2 flex flex-shrink-0 items-center gap-2">
            <img src={logo} alt="ShivraTech" className="h-36 w-36 object-contain" />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className={navLinkClassName}>
                {link.label}
              </NavLink>
            ))}

            <div className="relative" ref={dropRef}>
              <button
                type="button"
                onClick={() => setCatOpen((previous) => !previous)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
                  catOpen ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
                }`}
              >
                Categories
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
                />
              </button>

              {catOpen && (
                <div
                  className="absolute left-1/2 top-[calc(100%+10px)] w-[660px] -translate-x-1/2 rounded-2xl border bg-white p-5 shadow-[0_32px_80px_rgba(74,13,79,0.28)]"
                  style={{ borderColor: `${ACCENT}66`, zIndex: 200 }}
                >
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[.12em] text-slate-500">
                    Browse all categories
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const Icon = categoryIcons[category.slug] ?? Sparkles;

                      return (
                        <Link
                          key={category.slug}
                          to={`/categories#${category.slug}`}
                          className="group flex items-center gap-3.5 rounded-[14px] border border-transparent px-4 py-3.5 transition hover:bg-[#B35FA3]/10"
                        >
                          <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl bg-[#F8F0FA] text-[#4A0D4F]">
                            <Icon size={24} strokeWidth={2} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[14px] font-bold text-slate-900">
                              {category.name}
                            </p>
                            <p className="text-[12px] text-slate-600">
                              {category.desc}
                            </p>
                          </div>
                          <ArrowRight
                            size={15}
                            className="flex-shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-[#B35FA3]"
                          />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-[14px] border bg-gradient-to-r from-[#4A0D4F]/10 via-white to-[#B35FA3]/10 px-5 py-3.5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#4A0D4F]">
                        Limited time
                      </p>
                      <p className="text-[15px] font-black text-slate-900">
                        First ad slot free this week.
                      </p>
                    </div>
                    <Link
                      to="/login"
                      className="flex-shrink-0 rounded-full px-5 py-2.5 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-px"
                      style={{
                        background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                      }}
                    >
                      Sell with us
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative hidden md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm"
              style={{ borderColor: `${ACCENT}80` }}
            >
              <Search
                size={15}
                className="flex-shrink-0"
                style={{ color: PRIMARY }}
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search products..."
                className="w-36 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
              />
            </form>

            {suggestions.length > 0 && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-[360px] rounded-2xl border bg-white p-3 shadow-[0_18px_42px_rgba(74,13,79,0.16)]"
                style={{ borderColor: "#eadbe6" }}
              >
                <div className="space-y-2">
                  {suggestions.map((product) => (
                    <Link
                      key={product.slug}
                      to={`/product/${product.slug}`}
                      className="flex items-center gap-3 rounded-[16px] px-3 py-3 transition hover:bg-[#fbf6fa]"
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-[14px]"
                        style={{ backgroundColor: "#fbf6fa" }}
                      >
                        <img
                          src={product.img}
                          alt={product.title}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {product.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.categoryName}
                        </p>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
                        {product.price}
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  to={`/shop?q=${encodeURIComponent(trimmedSearch)}`}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                  style={{ color: PRIMARY }}
                >
                  View all results
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-full border bg-white px-2.5 py-1.5 shadow-sm"
              style={{ borderColor: `${ACCENT}80` }}
            >
              <Link
                to="/login"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#B35FA3]/10"
                style={{ color: PRIMARY }}
                aria-label="Login"
              >
                <User size={17} strokeWidth={2} />
              </Link>
              <Link
                to="/shop#featured"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#B35FA3]/10"
                style={{ color: PRIMARY }}
                aria-label="Wishlist"
              >
                <Heart size={17} strokeWidth={2} />
              </Link>
              <Link
                to="/shop"
                className="relative flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#B35FA3]/10"
                style={{ color: PRIMARY }}
                aria-label="Cart"
              >
                <ShoppingCart size={17} strokeWidth={2} />
                <span
                  className="absolute right-0.5 top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full border-[1.5px] border-white bg-white text-[9px] font-black"
                  style={{ color: PRIMARY }}
                >
                  2
                </span>
              </Link>
            </div>

            <Link
              to="/contact"
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-black transition md:flex"
              style={{
                color: PRIMARY,
                boxShadow: "0 8px 20px rgba(74,13,79,0.15)",
              }}
            >
              Advertise with us
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white transition lg:hidden"
              style={{
                color: PRIMARY,
                borderColor: `${ACCENT}80`,
              }}
              aria-label="Open menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="border-t bg-white px-5 py-4 shadow-inner lg:hidden"
            style={{ borderColor: `${ACCENT}80` }}
          >
            {[...navLinks, { label: "Categories", to: "/categories" }].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-[14px] font-semibold transition ${
                    isActive ? "bg-[#f4e8f3]" : "hover:bg-[#B35FA3]/10"
                  }`
                }
                style={{ color: PRIMARY }}
              >
                {link.label}
              </NavLink>
            ))}

            <form
              onSubmit={handleSearchSubmit}
              className="mt-3 flex items-center gap-2 rounded-full border bg-white px-4 py-2.5"
              style={{ borderColor: `${ACCENT}80` }}
            >
              <Search size={15} style={{ color: PRIMARY }} />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-500"
              />
            </form>

            {suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {suggestions.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/product/${product.slug}`}
                    className="flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3"
                    style={{ borderColor: "#eadbe6" }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {product.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.categoryName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: PRIMARY }}>
                      {product.price}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="h-[68px]" />
    </>
  );
};

export default Navbar;
