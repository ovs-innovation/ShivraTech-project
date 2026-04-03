import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const NotFound = () => {
  return (
    <section className="px-6 py-16">
      <div
        className="mx-auto max-w-3xl rounded-[32px] border px-8 py-12 text-center md:px-12"
        style={{
          borderColor: "#eadbe6",
          background:
            "linear-gradient(135deg, rgba(247,240,246,0.96) 0%, rgba(255,255,255,1) 100%)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: PRIMARY }}
        >
          404 route
        </p>
        <h1 className="mt-4 text-4xl font-black text-slate-900">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
          That route does not exist yet. You can jump back to the home page or
          continue reviewing the storefront from the shop route.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
            }}
          >
            Go home
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/shop"
            className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{ borderColor: ACCENT, color: PRIMARY }}
          >
            Open shop
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
