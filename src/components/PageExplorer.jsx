import React from "react";
import {
  ArrowRight,
  Grid3X3,
  House,
  Info,
  LogIn,
  Mail,
  ShieldQuestion,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

const pages = [
  {
    title: "Home",
    desc: "Landing page with the hero, featured sections, and best-selling products.",
    to: "/",
    Icon: House,
  },
  {
    title: "About",
    desc: "Brand story, marketplace value, and service highlights for ShivraTech.",
    to: "/about",
    Icon: Info,
  },
  {
    title: "Shop",
    desc: "Promo carousel, category-led browsing, and product showcase content.",
    to: "/shop",
    Icon: ShoppingBag,
  },
  {
    title: "Categories",
    desc: "A visual grid of product areas with direct route links for each category.",
    to: "/categories",
    Icon: Grid3X3,
  },
  {
    title: "Contact",
    desc: "Contact form and direct support details for calls, email, and follow-up.",
    to: "/contact",
    Icon: Mail,
  },
  {
    title: "Support",
    desc: "FAQs and policy pages wired with React Router from the footer.",
    to: "/support/faqs",
    Icon: ShieldQuestion,
  },
  {
    title: "Login",
    desc: "Customer and vendor login screen with a more polished visual layout.",
    to: "/login",
    Icon: LogIn,
  },
];

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const PageExplorer = () => {
  return (
    <section className="px-6 py-16 bg-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Visual routing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Browse every screen in one place
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Every primary section below is now attached to React Router, so
              you can move around the site visually instead of relying on
              placeholder links.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{ borderColor: ACCENT, color: PRIMARY }}
          >
            Open the storefront
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pages.map(({ title, desc, to, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-[24px] border bg-white p-6 shadow-[0_18px_50px_rgba(74,13,79,0.08)] transition hover:-translate-y-1"
              style={{ borderColor: "#eadbe6" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(74,13,79,0.12) 0%, rgba(179,95,163,0.18) 100%)",
                  color: PRIMARY,
                }}
              >
                {React.createElement(Icon, { size: 22, strokeWidth: 2.2 })}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                  <ArrowRight
                    size={18}
                    className="text-slate-400 transition group-hover:translate-x-1"
                  />
                </div>
                <p className="text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PageExplorer;
