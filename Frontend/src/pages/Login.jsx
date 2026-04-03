import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Store, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const Login = () => {
  const [isCustomer, setIsCustomer] = useState(true);
  const [authMode, setAuthMode] = useState("login");

  const isSignup = authMode === "signup";
  const accountLabel = isCustomer ? "Customer" : "Vendor";
  const heading = isSignup
    ? `${accountLabel} sign up`
    : `${accountLabel} login`;
  const heroCopy = isSignup
    ? "Create a new account and step into the routed storefront experience."
    : "Switch between shopper and seller access while keeping the storefront flow fully routed and easy to preview.";
  const formEyebrow = isSignup ? "Create account" : "Welcome back";
  const formTitle = isSignup
    ? isCustomer
      ? "Sign up to start shopping"
      : "Sign up to launch your store"
    : isCustomer
      ? "Sign in to continue shopping"
      : "Sign in to manage your store";
  const primaryButtonLabel = isSignup ? "Create account" : "Login";

  return (
    <section className="px-6 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div
          className="overflow-hidden rounded-[32px] border bg-white shadow-[0_24px_70px_rgba(74,13,79,0.08)] lg:grid lg:grid-cols-[0.9fr_1.1fr]"
          style={{ borderColor: "#eadbe6" }}
        >
          <div
            className="flex flex-col justify-between gap-8 px-8 py-10 text-white md:px-10 md:py-12"
            style={{
              background: `linear-gradient(160deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
            }}
          >
            <div className="space-y-5">
              <span className="inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">
                Account access
              </span>
              <h1 className="text-4xl font-black leading-tight">{heading}</h1>
              <p className="max-w-md text-sm leading-7 text-white/80">
                {heroCopy}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  label: "Shopper ready",
                  text: "Quick route back into products and promotions.",
                  Icon: UserRound,
                },
                {
                  label: "Vendor tools",
                  text: "Use the seller flow to start showcasing inventory.",
                  Icon: Store,
                },
                {
                  label: "Secure access",
                  text: "Placeholder screen designed for the future auth flow.",
                  Icon: ShieldCheck,
                },
              ].map(({ label, text, Icon }) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                >
                  {React.createElement(Icon, { size: 20 })}
                  <h2 className="mt-3 text-lg font-bold">{label}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-10 md:px-10 md:py-12">
            <div className="space-y-4">
              <div className="flex rounded-full bg-[#f7eef6] p-1">
                <button
                  type="button"
                  onClick={() => setIsCustomer(true)}
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isCustomer ? "text-white" : "text-slate-600"
                  }`}
                  style={{
                    background: isCustomer
                      ? `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`
                      : "transparent",
                  }}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomer(false)}
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    !isCustomer ? "text-white" : "text-slate-600"
                  }`}
                  style={{
                    background: !isCustomer
                      ? `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`
                      : "transparent",
                  }}
                >
                  Vendor
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {formEyebrow}
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {formTitle}
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  {isSignup ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setAuthMode(isSignup ? "login" : "signup")}
                    className="font-semibold underline underline-offset-4"
                    style={{ color: PRIMARY }}
                  >
                    {isSignup ? "Login" : "Sign up"}
                  </button>
                </p>
              </div>

              <form className="space-y-5">
                {isSignup ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Full name
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                      style={{ borderColor: "#e5dbe7" }}
                    />
                  </label>
                ) : null}

                {isSignup && !isCustomer ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Store name
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your store name"
                      className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                      style={{ borderColor: "#e5dbe7" }}
                    />
                  </label>
                ) : null}

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Email
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                    style={{ borderColor: "#e5dbe7" }}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Password
                  </span>
                  <input
                    type="password"
                    placeholder={isSignup ? "Create a password" : "Enter your password"}
                    className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                    style={{ borderColor: "#e5dbe7" }}
                  />
                </label>

                {isSignup ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Confirm password
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full rounded-2xl border px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#B35FA3]"
                      style={{ borderColor: "#e5dbe7" }}
                    />
                  </label>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
                    }}
                  >
                    {primaryButtonLabel}
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    to={isSignup ? "/contact" : "/support/faqs"}
                    className="text-sm font-semibold"
                    style={{ color: PRIMARY }}
                  >
                    {isSignup ? "Need onboarding help?" : "Forgot password?"}
                  </Link>
                </div>
              </form>

              <div className="rounded-[24px] bg-[#fbf6fa] p-5">
                <p className="text-sm leading-7 text-slate-600">
                  {isSignup
                    ? "Already have an account? Switch back to login or contact us if you want help setting up your storefront."
                    : "Need a new account? Switch to sign up, ask for onboarding help, or head back to the storefront to keep reviewing the app."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="rounded-full border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: "#eadbe6", color: "#475569" }}
                  >
                    Request access
                  </Link>
                  <Link
                    to="/shop"
                    className="rounded-full border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: "#eadbe6", color: "#475569" }}
                  >
                    Back to shop
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
