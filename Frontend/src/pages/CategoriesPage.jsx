import React from "react";
import {
  ArrowRight,
  CarFront,
  Headphones,
  LaptopMinimal,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import { allProducts } from "../data/products";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const iconMap = {
  audio: Headphones,
  "mobile-accessories": Smartphone,
  "pc-accessories": LaptopMinimal,
  "car-accessories": CarFront,
  lifestyle: Sparkles,
};

const CategoriesPage = () => {
  const { categories, error } = useCategories();

  return (
    <section className="px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
      <div className="mx-auto max-w-6xl space-y-10">
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">
            {error}
          </p>
        )}
        <div
          className="rounded-[32px] border px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12"
          style={{
            borderColor: "#eadbe6",
            background:
              "linear-gradient(135deg, rgba(247,240,246,0.96) 0%, rgba(255,255,255,1) 58%, rgba(244,232,243,0.92) 100%)",
          }}
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: PRIMARY }}
              >
                Category routing
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                Explore every category visually.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                Each category now has a stronger visual card, clearer purpose,
                and a more polished route target for browsing products.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {categories.map((category) => {
                const count = allProducts.filter(
                  (product) => product.categorySlug === category.slug,
                ).length;

                return (
                  <Link
                    key={category.slug}
                    to={`/categories#${category.slug}`}
                    className="rounded-[24px] border bg-white p-5 transition hover:-translate-y-1"
                    style={{ borderColor: "#eadbe6" }}
                  >
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.16em]"
                      style={{ color: PRIMARY }}
                    >
                      {category.name}
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {count}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">products live</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {categories.map((category, index) => {
            const Icon = iconMap[category.slug] ?? Sparkles;
            const productCount = allProducts.filter(
              (product) => product.categorySlug === category.slug,
            ).length;

            return (
              <article
                key={category.slug}
                id={category.slug}
                className="scroll-mt-28 overflow-hidden rounded-[30px] border bg-white shadow-[0_18px_50px_rgba(74,13,79,0.06)]"
                style={{ borderColor: "#eadbe6" }}
              >
                <div className="grid gap-0 lg:grid-cols-[390px_1fr]">
                  <div className="relative min-h-[280px] overflow-hidden sm:min-h-[320px]">
                    <img
                      src={category.img}
                      alt={category.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#240428]/82 via-[#4A0D4F]/58 to-[#B35FA3]/30" />
                    <div className="absolute left-6 top-6 flex items-center gap-3">
                      <div className="rounded-full bg-white/15 p-3 text-white backdrop-blur-sm">
                        {category.icon ? (
                          <span className="text-xl" aria-hidden="true">{category.icon}</span>
                        ) : (
                          React.createElement(Icon, { size: 20, strokeWidth: 2.3 })
                        )}
                      </div>
                      <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                        {category.focus}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                        {productCount} products
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-white">
                        {category.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-6 p-5 sm:p-8 md:p-10">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                          style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                        >
                          {category.name}
                        </span>
                        <span className="rounded-full border px-3 py-1 text-xs font-semibold text-slate-600">
                          {productCount} items
                        </span>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
                          {category.desc}
                        </h3>
                        <p className="max-w-2xl text-sm leading-7 text-slate-600">
                          {category.bestFor}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div
                          className="rounded-[22px] p-5"
                          style={{ backgroundColor: "#fbf6fa" }}
                        >
                          <p
                            className="text-[11px] font-bold uppercase tracking-[0.16em]"
                            style={{ color: PRIMARY }}
                          >
                            Focus area
                          </p>
                          <p className="mt-3 text-lg font-bold text-slate-900">
                            {category.focus}
                          </p>
                        </div>
                        <div
                          className="rounded-[22px] p-5"
                          style={{ backgroundColor: "#fbf6fa" }}
                        >
                          <p
                            className="text-[11px] font-bold uppercase tracking-[0.16em]"
                            style={{ color: PRIMARY }}
                          >
                            Route target
                          </p>
                          <p className="mt-3 text-lg font-bold text-slate-900">
                            /categories#{category.slug}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link
                        to={`/shop`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:w-auto"
                        style={{
                          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                        }}
                      >
                        Open shop
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/contact"
                        className="w-full rounded-full border px-5 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 sm:w-auto"
                        style={{ borderColor: ACCENT, color: PRIMARY }}
                      >
                        Advertise this category
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesPage;
