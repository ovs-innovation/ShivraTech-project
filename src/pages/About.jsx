import React from "react";
import { ArrowRight, BadgeCheck, Megaphone, Store } from "lucide-react";
import { Link } from "react-router-dom";
import Features from "../components/Features";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const highlights = [
  {
    title: "Hyper-local reach",
    desc: "Help buyers discover nearby gadget sellers faster with city-focused promotion.",
    Icon: Megaphone,
  },
  {
    title: "Trusted storefronts",
    desc: "Give vendors a cleaner digital shelf with stronger product presentation.",
    Icon: Store,
  },
  {
    title: "Reliable fulfillment",
    desc: "Blend local inventory with quick delivery expectations and buyer confidence.",
    Icon: BadgeCheck,
  },
];

const About = () => {
  return (
    <>
      <section className="px-6 pb-14 pt-10">
        <div className="mx-auto max-w-6xl">
          <div
            className="overflow-hidden rounded-[32px] border px-8 py-10 shadow-[0_24px_70px_rgba(74,13,79,0.10)] md:px-12 md:py-14"
            style={{
              borderColor: "#eadbe6",
              background:
                "linear-gradient(135deg, rgba(247,240,246,0.96) 0%, rgba(255,255,255,1) 52%, rgba(244,232,243,0.92) 100%)",
            }}
          >
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="space-y-6">
                <span
                  className="inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                >
                  About ShivraTech
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                    Building a more visual gadget marketplace for local sellers.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-slate-600">
                    ShivraTech is designed to help electronics sellers show
                    their products better, advertise them locally, and convert
                    more buyers with a storefront that feels modern from the
                    first click.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                    }}
                  >
                    Explore shop
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                    style={{ borderColor: ACCENT, color: PRIMARY }}
                  >
                    Talk to our team
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[24px] border bg-white p-6" style={{ borderColor: "#eadbe6" }}>
                  <p className="text-sm font-semibold text-slate-500">
                    Seller-ready setup
                  </p>
                  <p className="mt-3 text-4xl font-black" style={{ color: PRIMARY }}>
                    0
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    setup fee for the first step into the marketplace flow.
                  </p>
                </div>
                <div className="rounded-[24px] border bg-white p-6" style={{ borderColor: "#eadbe6" }}>
                  <p className="text-sm font-semibold text-slate-500">
                    Delivery promise
                  </p>
                  <p className="mt-3 text-4xl font-black" style={{ color: PRIMARY }}>
                    Same day
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    routes are highlighted visually across the storefront.
                  </p>
                </div>
                <div className="rounded-[24px] border bg-white p-6" style={{ borderColor: "#eadbe6" }}>
                  <p className="text-sm font-semibold text-slate-500">
                    Ad visibility
                  </p>
                  <p className="mt-3 text-4xl font-black" style={{ color: PRIMARY }}>
                    Local first
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    campaigns are positioned to match shoppers nearby.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map(({ title, desc, Icon }) => (
              <article
                key={title}
                className="rounded-[24px] border bg-white p-6 shadow-[0_18px_44px_rgba(74,13,79,0.06)]"
                style={{ borderColor: "#eadbe6" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#f4e8f3", color: PRIMARY }}
                >
                  {React.createElement(Icon, { size: 22, strokeWidth: 2.2 })}
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Features />

      <section className="px-6 pb-16">
        <div
          className="mx-auto max-w-6xl rounded-[30px] border px-8 py-10 text-center"
          style={{
            borderColor: "#eadbe6",
            background:
              "linear-gradient(135deg, rgba(74,13,79,0.96) 0%, rgba(179,95,163,0.94) 100%)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            Next step
          </p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
            Ready to see the routed storefront in action?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80">
            Browse the shop flow, open the categories screen, or jump straight
            into the contact page and test the full navigation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/categories"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{ color: PRIMARY }}
            >
              View categories
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open login
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
