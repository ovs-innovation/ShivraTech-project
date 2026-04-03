import React from "react";
import { CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <Truck size={28} />,
    title: "Fast delivery",
    desc: "Get products from nearby vendors quickly.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Secure shopping",
    desc: "Verified stores, protected payments, no surprises.",
  },
  {
    icon: <Headphones size={28} />,
    title: "24/7 support",
    desc: "We are always here to help across chat and call.",
  },
  {
    icon: <CreditCard size={28} />,
    title: "Easy payments",
    desc: "Cards, UPI, BNPL, and COD all supported.",
  },
];

const Features = () => {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: "#4A0D4F" }}
            >
              Why ShivraTech
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Built to be reliable
            </h2>
            <p className="text-sm text-slate-600">
              Modern infra, local partners, and thoughtful support keep orders
              moving.
            </p>
          </div>
          <Link
            to="/support/faqs"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 sm:w-auto"
            style={{ borderColor: "#B35FA3", color: "#4A0D4F" }}
          >
            View service levels
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-lg shadow-[#B35FA3]/20 transition hover:-translate-y-1 hover:border-[#B35FA3] hover:shadow-[#B35FA3]/30 sm:p-5"
              style={{ borderColor: "#B35FA3" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A0D4F]/25 via-[#B35FA3]/12 to-[#4A0D4F]/25 opacity-0 blur-3xl transition group-hover:opacity-100 group-hover:blur-2xl" />
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#f4e8f3", color: "#4A0D4F" }}
              >
                {item.icon}
              </div>
              <h3 className="relative mt-4 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="relative mt-2 text-sm text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
