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
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  SITE_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
} from "../data/siteContact";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const companyLinks = [
  { label: "About us", to: "/about" },
  { label: "Contact us", to: "/contact" },
  { label: "Our Blog", to: "/shop#insights" },
  { label: "Admin Portal", href: "http://localhost:5175" },
];

const shopLinks = [
  { label: "Mobile Accessories", to: "/categories#mobile-accessories" },
  { label: "PC Accessories", to: "/categories#pc-accessories" },
  { label: "Car Accessories", to: "/categories#car-accessories" },
  { label: "Lifestyle Accessories", to: "/categories#lifestyle" },
];

const supportLinks = [
  { label: "Privacy Policy", to: "/support/privacy" },
  { label: "Terms of Service", to: "/support/terms" },
  { label: "Contact Us", to: "/contact" },
  { label: "FAQs", to: "/support/faqs" },
  { label: "Refund Policy", to: "/support/refund" },
];

const paymentBadges = ["PayPal", "VISA", "Mastercard", "Stripe"];

const socialLinks = [
  { label: "Website", Icon: Globe, to: "/", internal: true },
  { label: "Updates", Icon: Send, to: "/shop#insights", internal: true },
  { label: "Email", Icon: AtSign, to: `mailto:${SITE_EMAIL}` },
  { label: "Share", Icon: Share2, to: "/contact", internal: true },
];

const Footer = () => {
  return (
    <footer className="bg-white" style={{ borderTop: `3px solid ${ACCENT}` }}>
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_1.05fr] lg:gap-12">
          <div className="space-y-5">
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ backgroundColor: "#f6e9f4", color: PRIMARY }}
            >
              Rare Tech. Real Impact.
            </span>

            <Link to="/" className="block w-fit">
              <img
                src={logo}
                alt="ShivraTech"
                className="h-16 w-auto object-contain"
              />
            </Link>

            <p className="max-w-sm text-[15px] leading-7 text-slate-600 sm:text-[17px] sm:leading-8">
              The home and elements needed to create beautiful gadget buying and
              selling experiences across local markets.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ label, Icon, to, internal }) =>
                internal ? (
                  <Link
                    key={label}
                    to={to}
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5"
                    style={{
                      borderColor: "#eadbe6",
                      color: PRIMARY,
                      backgroundColor: "#fff",
                    }}
                  >
                    {React.createElement(Icon, { size: 18, strokeWidth: 2 })}
                  </Link>
                ) : (
                  <a
                    key={label}
                    href={to}
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5"
                    style={{
                      borderColor: "#eadbe6",
                      color: PRIMARY,
                      backgroundColor: "#fff",
                    }}
                  >
                    {React.createElement(Icon, { size: 18, strokeWidth: 2 })}
                  </a>
                ),
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Company</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>
            <div className="space-y-3 text-[15px] text-slate-600 sm:space-y-4 sm:text-[17px]">
              {companyLinks.map((item) =>
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition hover:text-slate-900"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="block transition hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Shop</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>
            <div className="space-y-3 text-[15px] text-slate-600 sm:space-y-4 sm:text-[17px]">
              {shopLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block transition hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Support</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>
            <div className="space-y-3 text-[15px] text-slate-600 sm:space-y-4 sm:text-[17px]">
              {supportLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block transition hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Talk To Us</h3>
              <span
                className="block h-1 w-10 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
              />
            </div>

            <div className="space-y-5 text-[15px] leading-7 text-slate-600 sm:text-[16px]">
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
                  <Link
                    to="/contact"
                    style={{ color: ACCENT }}
                    className="font-semibold underline underline-offset-4"
                  >
                    Our Stores
                  </Link>
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
                  className="break-words text-[18px] font-semibold leading-tight text-slate-900 sm:text-[22px] sm:leading-none"
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
                <a href={`mailto:${SITE_EMAIL}`} className="break-words">
                  {SITE_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-12 flex flex-col gap-6 border-t pt-8 md:mt-14 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "#eee2eb" }}
        >
          <p className="text-[15px] text-slate-500 sm:text-[17px]">
            Copyright &copy; 2026 by{" "}
            <span style={{ color: ACCENT }}>ShivraTech</span> All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {paymentBadges.map((item) => (
              <span
                key={item}
                className="inline-flex min-w-[68px] items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold text-slate-600 sm:min-w-[76px] sm:px-4 sm:text-sm"
                style={{ borderColor: "#e6e4ea", backgroundColor: "#fff" }}
              >
                {item}
              </span>
            ))}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="ml-1 inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_14px_32px_rgba(74,13,79,0.28)] transition hover:-translate-y-0.5 sm:h-14 sm:w-14"
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
