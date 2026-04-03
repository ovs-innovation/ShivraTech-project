import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/catalog";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const CategoriesPage = () => {
  return (
    <section className="px-6 pb-16 pt-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <div
          className="rounded-[32px] border px-8 py-10 md:px-12 md:py-12"
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
              <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                Explore every category visually.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                Each card below has its own anchored route target, so the
                navbar dropdown and category links can land on a real section
                instead of a placeholder.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/categories#${category.slug}`}
                  className="rounded-full border bg-white px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{ borderColor: ACCENT, color: PRIMARY }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {categories.map((category, index) => (
            <article
              key={category.slug}
              id={category.slug}
              className="scroll-mt-28 overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_50px_rgba(74,13,79,0.06)]"
              style={{ borderColor: "#eadbe6" }}
            >
              <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
                <div className="h-full min-h-[280px] overflow-hidden bg-[#f4e8f3]">
                  <img
                    src={category.img}
                    alt={category.name}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>

                <div className="flex flex-col justify-between gap-6 p-8 md:p-10">
                  <div className="space-y-4">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                      style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                    >
                      {category.name}
                    </span>
                    <h2 className="text-3xl font-black text-slate-900">
                      {category.desc}
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600">
                      Use this route to preview how category-specific entry
                      points can feel in the storefront while keeping the whole
                      experience attached to React Router.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                      }}
                    >
                      Open shop
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      to="/contact"
                      className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                      style={{ borderColor: ACCENT, color: PRIMARY }}
                    >
                      Advertise this category
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesPage;
