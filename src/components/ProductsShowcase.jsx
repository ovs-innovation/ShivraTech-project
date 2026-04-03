import React, { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import categoryCar from "../assets/categoryCar.jpg";
import categorySpeaker from "../assets/categorySpeaker.jpg";
import categoryWatch from "../assets/categoryWatch.jpg";
import rightHero from "../assets/rightHero.png";
import rightHero1 from "../assets/rightHero1.png";
import rightHero2 from "../assets/rightHero2.png";

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

const sections = [
  {
    key: "audio-pc",
    label: "Audio & PC Accessories",
    title: "Popular picks",
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
      },
      {
        title:
          "Smart Drive Media Kit, 256 GB storage with dashboard-ready setup",
        price: "Rs. 21,999.00",
        mrp: "Rs. 24,000.00",
        off: "8% OFF",
        promo: "7.5% OFF or 6 month EMI",
        rating: 4,
        reviews: 92,
        img: rightHero1,
      },
      {
        title: "Creative Desk Essentials for work, streaming and daily setup",
        price: "Rs. 29,999.00",
        mrp: "Rs. 36,999.00",
        off: "19% OFF",
        promo: "Special exchange offer",
        rating: 5,
        reviews: 118,
        img: rightHero2,
      },
      {
        title: "Premium Sound Pod with compact build and room-filling output",
        price: "Rs. 17,999.00",
        mrp: "Rs. 19,999.00",
        off: "10% OFF",
        promo: "Bank offer available",
        rating: 4,
        reviews: 86,
        img: rightHero,
      },
    ],
  },
  {
    key: "lifestyle",
    label: "Lifestyle Accessories",
    title: "Recommended for shoppers",
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
      },
    ],
  },
];

const ProductsShowcase = () => {
  const [activeBlogSlide, setActiveBlogSlide] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveBlogSlide((current) => (current + 1) % blogSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section id="featured" className="px-6 py-16" style={{ background: SECTION_BG }}>
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-2 text-left">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PRIMARY }}
          >
            Product showcase
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Best deals for your customers
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Professional ecommerce cards with cleaner sizing, stronger images,
            and aligned product details.
          </p>
        </div>

        {sections.map((section, sectionIdx) => (
          <div key={section.key} className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: PRIMARY }}
                >
                  {section.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {section.title}
                </h3>
              </div>
              <Link
                to={section.viewAllLink}
                className="rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
                style={{ borderColor: ACCENT, color: PRIMARY }}
              >
                View all
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {section.cards.map((card, idx) => (
                <article
                  key={`${section.key}-${idx}`}
                  className="group relative overflow-hidden rounded-[18px] border bg-white p-3 shadow-[0_4px_16px_rgba(74,13,79,0.08)]"
                  style={{ borderColor: "#eadbe6" }}
                >
                  <div
                    className="absolute left-0 top-0 z-10 max-w-[78%] rounded-br-xl px-3 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white"
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

                  <div
                    className="mt-9 rounded-2xl"
                    style={{ background: IMAGE_PANEL_BG }}
                  >
                    <div className="flex h-[12.75rem] items-center justify-center px-3 py-3">
                      <img
                        src={card.img}
                        alt={card.title}
                        className="h-[96%] w-[96%] object-contain transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 px-1 pb-1 pt-4 text-left">
                    <h4 className="min-h-[3.5rem] text-[15px] font-medium leading-6 text-slate-800 line-clamp-2">
                      {card.title}
                    </h4>

                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[17px] font-bold text-slate-900">
                          {card.price}
                        </span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {card.off}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-through">
                        MRP {card.mrp}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={15}
                          fill={
                            starIdx < card.rating ? "#f59e0b" : "transparent"
                          }
                          color={starIdx < card.rating ? "#f59e0b" : "#d1d5db"}
                        />
                      ))}
                      <span className="ml-1 text-[13px] font-semibold text-slate-600">
                        ({card.reviews})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        to="/login"
                        className="rounded-full border px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em]"
                        style={{
                          borderColor: ACCENT,
                          color: PRIMARY,
                          backgroundColor: "#fff",
                        }}
                      >
                        Add to cart
                      </Link>
                      <Link
                        to="/contact"
                        className="rounded-full px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                        }}
                      >
                        Buy now
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {sectionIdx === 0 && (
              <div
                className="rounded-[20px] border bg-white px-6 py-5"
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
                      <h4 className="text-3xl font-black uppercase tracking-[0.04em] text-slate-900 sm:text-4xl">
                        Order Today
                      </h4>
                      <span
                        className="hidden h-8 w-px md:block"
                        style={{ backgroundColor: "#eadbe6" }}
                      />
                      <h4
                        className="text-3xl font-black uppercase tracking-[0.04em] sm:text-4xl"
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
            )}
          </div>
        ))}

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
                      className="h-[17rem] w-full object-cover transition duration-300 group-hover:scale-105"
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
