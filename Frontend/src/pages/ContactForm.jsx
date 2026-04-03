import React, { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  SITE_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
} from "../data/siteContact";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    console.log("Form submitted:", formData);
  };

  return (
    <section className="px-6 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className="rounded-[32px] px-8 py-10 text-white md:px-10 md:py-12"
            style={{
              background: `linear-gradient(160deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              Contact route
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              Tell us what you want to sell or buy.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/80">
              This page is now part of the routed flow, so every call-to-action
              across the site can land here with a clear next step.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { label: SITE_PHONE_DISPLAY, helper: "Call us", Icon: Phone, href: `tel:${SITE_PHONE_TEL}` },
                { label: SITE_EMAIL, helper: "Email us", Icon: Mail, href: `mailto:${SITE_EMAIL}` },
                { label: "ShivraTech marketplace support", helper: "Location", Icon: MapPin, href: "#" },
              ].map(({ label, helper, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-4 rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="mt-1 rounded-full bg-white/15 p-3">
                    {React.createElement(Icon, { size: 18 })}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                      {helper}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">
                      {label}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div
            className="rounded-[32px] border bg-white px-8 py-10 shadow-[0_24px_70px_rgba(74,13,79,0.08)] md:px-10 md:py-12"
            style={{ borderColor: "#eadbe6" }}
          >
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                Send a message
              </p>
              <h2 className="text-3xl font-black text-slate-900">
                Contact the ShivraTech team
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                Use the form below to ask about products, ads, support, or
                onboarding for sellers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                  style={{ borderColor: "#e5dbe7" }}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                  style={{ borderColor: "#e5dbe7" }}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Message
                </span>
                <textarea
                  className="min-h-36 w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                  style={{ borderColor: "#e5dbe7" }}
                  id="message"
                  name="message"
                  placeholder="Tell us what you need"
                  value={formData.message}
                  onChange={handleChange}
                />
              </label>

              <button
                className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                }}
                type="submit"
              >
                Submit
              </button>
            </form>

            {submitted ? (
              <div
                className="mt-6 rounded-[24px] border px-5 py-4 text-sm leading-7"
                style={{ borderColor: "#e5dbe7", backgroundColor: "#fbf6fa", color: PRIMARY }}
              >
                Thanks. Your routed contact form submitted locally in the app
                preview.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
