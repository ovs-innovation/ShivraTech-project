import React from "react";
import {
  ArrowRight,
  Grid3X3,
  LogIn,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/catalog";
import { allProducts } from "../data/products";

const quickActions = [
  {
    title: "Shop Products",
    desc: "Browse all available gadgets and accessory listings in one place.",
    to: "/shop",
    Icon: ShoppingBag,
    badge: `${allProducts.length} products`,
  },
  {
    title: "Explore Categories",
    desc: "Jump straight into product groups like audio, mobile, PC, and car tech.",
    to: "/categories",
    Icon: Grid3X3,
    badge: `${categories.length} categories`,
  },
  {
    title: "Sell on ShivraTech",
    desc: "Open the seller login flow and get started with showcasing inventory.",
    to: "/login",
    Icon: LogIn,
    badge: "Vendor access",
  },
  {
    title: "Talk to Us",
    desc: "Reach out for product help, support, promotions, or onboarding.",
    to: "/contact",
    Icon: Mail,
    badge: "Quick support",
  },
];

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const PageExplorer = () => {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              Quick actions
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What do you want to do today?
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Start shopping, explore categories, sell products, or contact the
              team from one focused section built around how people actually use
              ShivraTech.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border bg-white px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 sm:w-auto"
            style={{ borderColor: ACCENT, color: PRIMARY }}
          >
            Start shopping
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          {quickActions.map(({ title, desc, to, Icon, badge }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-[24px] border bg-white p-5 shadow-[0_18px_50px_rgba(74,13,79,0.08)] transition hover:-translate-y-1 sm:p-6"
              style={{ borderColor: "#eadbe6" }}
            >
              <div className="flex items-start justify-between gap-3">
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
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                >
                  {badge}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {title}
                  </h3>
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
