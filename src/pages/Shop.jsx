import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Categories from "../components/Categories";
import ProductsShowcase from "../components/ProductsShowcase";
import PromoCarousel from "../components/PromoCarousel";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const Shop = () => {
  return (
    <>
      <section className="px-6 pb-8 pt-10">
        <div
          className="mx-auto max-w-6xl rounded-[32px] border px-8 py-10 shadow-[0_24px_70px_rgba(74,13,79,0.08)] md:px-12 md:py-12"
          style={{
            borderColor: "#eadbe6",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(247,240,246,0.96) 100%)",
          }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
                style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
              >
                <Sparkles size={14} />
                Shop route
              </span>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Browse the routed storefront with promos, categories, and
                product sections.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                This page brings together the discovery pieces of the site so
                you can review the overall shopping flow visually in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ borderColor: ACCENT, color: PRIMARY }}
              >
                Open categories
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              >
                Advertise products
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Categories />
      <PromoCarousel />
      <ProductsShowcase />
    </>
  );
};

export default Shop;
