import React from "react";
import {
  AtSign,
  ChevronUp,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  Share2,
} from "lucide-react";
import logo from "../assets/logo.png";
import {
  SITE_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
} from "../data/siteContact";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const companyLinks = ["About us", "Contact us", "Our Blog"];
const shopLinks = [
  "Mobile Accessories",
  "PC Accessories",
  "Car Accessories",
  "Lifestyle Accessories",
];
const supportLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Contact Us",
  "FAQs",
  "Refund Policy",
];
const paymentBadges = ["PayPal", "VISA", "Mastercard", "Stripe"];
const socialLinks = [
  { label: "Website", Icon: Globe },
  { label: "Updates", Icon: Send },
  { label: "Email", Icon: AtSign },
  { label: "Share", Icon: Share2 },
];

const Footer = () => {
  return (
    <footer className="bg-white" style={{ borderTop: `3px solid ${ACCENT}` }}>
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_1.05fr]">
          <div className="space-y-5">
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ backgroundColor: "#f6e9f4", color: PRIMARY }}
            >
              Rare Tech. Real Impact.
            </span>

            <img
              src={logo}
              alt="ShivraTech"
              className="h-16 w-auto object-contain"
            />

            <p className="max-w-sm text-[17px] leading-8 text-slate-600">
              The home and elements needed to create beautiful gadget buying and
              selling experiences across local markets.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5"
                  style={{
                    borderColor: "#eadbe6",
                    color: PRIMARY,
                    backgroundColor: "#fff",
                  }}
                >
                  <Icon size={18} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Company</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>
            <div className="space-y-4 text-[17px] text-slate-600">
              {companyLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block transition hover:text-slate-900"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Shop</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>
            <div className="space-y-4 text-[17px] text-slate-600">
              {shopLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block transition hover:text-slate-900"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Support</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>
            <div className="space-y-4 text-[17px] text-slate-600">
              {supportLinks.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block transition hover:text-slate-900"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Talk To Us</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>

            <div className="space-y-5 text-[16px] leading-7 text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-1 shrink-0"
                  style={{ color: PRIMARY }}
                />
                <p>
                  Find a location nearest you.
                  <br />
                  See{" "}
                  <a
                    href="#"
                    style={{ color: ACCENT }}
                    className="font-semibold underline underline-offset-4"
                  >
                    Our Stores
                  </a>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={19}
                  className="mt-1 shrink-0"
                  style={{ color: PRIMARY }}
                />
                <a
                  href={`tel:${SITE_PHONE_TEL}`}
                  className="whitespace-nowrap text-[22px] font-semibold leading-none text-slate-900"
                >
                  {SITE_PHONE_DISPLAY}
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={19}
                  className="mt-1 shrink-0"
                  style={{ color: PRIMARY }}
                />
                <a href={`mailto:${SITE_EMAIL}`} className="whitespace-nowrap">
                  {SITE_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-14 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "#eee2eb" }}
        >
          <p className="text-[17px] text-slate-500">
            Copyright &copy; 2026 by{" "}
            <span style={{ color: ACCENT }}>ShivraTech</span> All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {paymentBadges.map((item) => (
              <span
                key={item}
                className="inline-flex min-w-[76px] items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold text-slate-600"
                style={{ borderColor: "#e6e4ea", backgroundColor: "#fff" }}
              >
                {item}
              </span>
            ))}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="ml-1 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_14px_32px_rgba(74,13,79,0.28)] transition hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
              aria-label="Back to top"
            >
              <ChevronUp size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
