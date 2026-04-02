import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import logo from "../assets/logo.png";

const links = ["Home", "About", "Shop", "Contact"];

const categories = [
  { name: "Audio", desc: "Earbuds, speakers, headphones", icon: "🎧" },
  { name: "Mobile Accessories", desc: "Chargers, holders, cases", icon: "📱" },
  { name: "PC Accessories", desc: "Keyboards, mice, hubs, stands", icon: "🖥️" },
  { name: "Car Accessories", desc: "Chargers, mounts, BT kits", icon: "🚗" },
  { name: "Lifestyle", desc: "Smart glasses, fitness", icon: "🕶️" },
];

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const Navbar = () => {
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setCatOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl shadow-sm"
        style={{
          background: `linear-gradient(135deg,${ACCENT},${PRIMARY})`,
          borderColor: `${ACCENT}33`,
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-6">
          {/* Brand */}
          <a
            href="#"
            className="flex flex-shrink-0 items-center gap-2 no-underline -ml-2"
          >
            <img src={logo} alt="Logo" className="h-36 w-36 object-contain" />
          </a>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l}
                href="#"
                className="rounded-xl px-3.5 py-2 text-[13px] font-semibold text-white/90 no-underline transition"
                style={{ boxShadow: "none" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = `${ACCENT}55`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {l}
              </a>
            ))}

            {/* Categories dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setCatOpen((p) => !p)}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition"
                style={{
                  color: catOpen ? "#fff" : "rgba(255,255,255,0.9)",
                  backgroundColor: catOpen ? `${ACCENT}44` : "transparent",
                }}
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
                    {categories.map((cat) => (
                      <a
                        key={cat.name}
                        href="#"
                        className="group flex items-center gap-3.5 rounded-[14px] border border-transparent px-4 py-3.5 no-underline transition hover:bg-[#B35FA3]/10"
                        style={{}}
                      >
                        <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl bg-[#F8F0FA] text-[26px] text-[var(--tw-text-opacity,#4A0D4F)]">
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-slate-900">
                            {cat.name}
                          </p>
                          <p className="text-[12px] text-slate-600">
                            {cat.desc}
                          </p>
                        </div>
                        <ArrowRight
                          size={15}
                          className="flex-shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-[#B35FA3]"
                        />
                      </a>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-[14px] border px-5 py-3.5 bg-gradient-to-r from-[#4A0D4F]/10 via-white to-[#B35FA3]/10">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#4A0D4F]">
                        Limited time
                      </p>
                      <p className="text-[15px] font-black text-slate-900">
                        First ad slot FREE this week 🔥
                      </p>
                    </div>
                    <button
                      className="flex-shrink-0 rounded-full px-5 py-2.5 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-px"
                      style={{
                        background: `linear-gradient(135deg,${PRIMARY},${ACCENT})`,
                      }}
                    >
                      Advertise now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div
            className="hidden items-center gap-2 rounded-full border bg-white px-4 py-2 transition md:flex shadow-sm"
            style={{
              borderColor: `${ACCENT}80`,
            }}
          >
            <Search
              size={15}
              className="flex-shrink-0"
              style={{ color: PRIMARY }}
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search products…"
              className="w-36 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 rounded-full border bg-white px-2.5 py-1.5 shadow-sm"
              style={{ borderColor: `${ACCENT}80` }}
            >
              {[User, Heart].map((Icon, idx) => (
                <button
                  key={idx}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition"
                  style={{
                    color: PRIMARY,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = `${ACCENT}1A`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Icon size={17} strokeWidth={2} />
                </button>
              ))}
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-full transition"
                style={{ color: PRIMARY }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = `${ACCENT}1A`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ShoppingCart size={17} strokeWidth={2} />
                <span
                  className="absolute right-0.5 top-0.5 flex h-[15px] w-[15px] items-center justify-center rounded-full border-[1.5px] border-white bg-white text-[9px] font-black"
                  style={{ color: PRIMARY }}
                >
                  2
                </span>
              </button>
            </div>

            <button
              className="hidden items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-black transition md:flex bg-white"
              style={{
                color: PRIMARY,
                boxShadow: "0 8px 20px rgba(74,13,79,0.15)",
              }}
            >
              Advertise with us <ArrowRight size={13} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white transition lg:hidden"
              style={{
                color: PRIMARY,
                borderColor: `${ACCENT}80`,
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="border-t bg-white px-5 py-4 lg:hidden shadow-inner"
            style={{ borderColor: `${ACCENT}80` }}
          >
            {[...links, "Categories"].map((l) => (
              <a
                key={l}
                href="#"
                className="block rounded-xl px-4 py-3 text-[14px] font-semibold no-underline transition"
                style={{ color: PRIMARY }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = `${ACCENT}10`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {l}
              </a>
            ))}
            <div
              className="mt-3 flex items-center gap-2 rounded-full border bg-white px-4 py-2.5"
              style={{ borderColor: `${ACCENT}80` }}
            >
              <Search size={15} style={{ color: PRIMARY }} />
              <input
                type="text"
                placeholder="Search products…"
                className="flex-1 bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        )}
      </nav>

      <div className="h-[48px]" />
    </>
  );
};

export default Navbar;
